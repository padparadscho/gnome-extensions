import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import St from "gi://St";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

import { buildMenu } from "./menu.js";
import { State } from "./state.js";
import { fetchUser, fetchRepos, InvalidTokenError } from "./api.js";

const POLL_SEC = 60;

/**
 * Panel indicator that displays GitHub repositories in a dropdown menu
 */
const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(ext) {
      super._init(0.5, _("GitHub"), false);

      this.ext = ext;
      this.settings = ext.getSettings();
      this.state = new State();
      this.pollId = null;
      this.sigIds = [];

      this.box = new St.BoxLayout({
        style_class: "github-tools-box",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.label = new St.Label({
        text: _("GitHub"),
        style_class: "github-tools-label",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.box.add_child(this.label);
      this.add_child(this.box);

      this.sigIds.push(
        this.settings.connect("changed::set-repositories-limit", () => {
          this.render();
        }),
      );

      this.sigIds.push(
        this.settings.connect("changed::set-personal-access-token", () => {
          this.state.reset();
          this.fetch();
        }),
      );

      this.unsubscribe = this.state.subscribe(() => this.render());

      this.fetch();
      this.pollId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        POLL_SEC,
        () => {
          this.fetch();
          return GLib.SOURCE_CONTINUE;
        },
      );
    }

    /**
     * Fetches user and repository data from GitHub API
     */
    async fetch() {
      const token = this.settings.get_string("set-personal-access-token").trim();

      if (!token) {
        this.state.setState({ user: null, repos: [], error: null });
        return;
      }

      try {
        const user = await fetchUser(token);
        const limit = this.settings.get_int("set-repositories-limit");
        const repos = await fetchRepos(token, limit);

        this.state.setState({ user, repos, error: null });
      } catch (error) {
        console.error("GitHub API error:", error);
        if (error instanceof InvalidTokenError) {
          this.state.setState({ user: null, repos: [], error: "Invalid GitHub PAT" });
        } else {
          this.state.setState({ error: "Network error" });
        }
      }
    }

    /**
     * Rebuilds menu from current state
     */
    render() {
      const token = this.settings.get_string("set-personal-access-token").trim();
      this.menu.removeAll();
      buildMenu(this.menu, this.state.getState(), this.ext.path, {
        openPreferences: () => this.ext.openPreferences(),
        hasToken: !!token,
      });
    }

    /**
     * Cleans up timeout, signals, and subscriptions
     */
    destroy() {
      for (const id of this.sigIds) this.settings.disconnect(id);
      this.sigIds = [];

      if (this.pollId) {
        GLib.Source.remove(this.pollId);
        this.pollId = null;
      }

      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      super.destroy();
    }
  },
);

/**
 * GitHub Tools extension entry point
 */
export default class GitHubToolsExtension extends Extension {
  /**
   * Creates and adds indicator to panel
   */
  enable() {
    this.ind = new Indicator(this);
    Main.panel.addToStatusArea(this.uuid, this.ind, 1, "left");
  }

  /**
   * Destroys indicator and cleans up
   */
  disable() {
    this.ind?.destroy();
    this.ind = null;
  }
}
