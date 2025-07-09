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

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(ext) {
      super._init(0.5, _("GitHub"), false);

      this._ext = ext;
      this._settings = ext.getSettings();
      this._state = new State();
      this._pollId = null;
      this._sigIds = [];

      this._box = new St.BoxLayout({
        style_class: "github-tools-box",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._label = new St.Label({
        text: _("GitHub"),
        style_class: "github-tools-label",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._box.add_child(this._label);
      this.add_child(this._box);

      this._sigIds.push(
        this._settings.connect("changed::set-repositories-limit", () => {
          this._render();
        }),
      );

      this._sigIds.push(
        this._settings.connect("changed::set-personal-access-token", () => {
          this._state.reset();
          this._fetch();
        }),
      );

      this._unsubscribe = this._state.subscribe(() => this._render());

      this._fetch();
      this._pollId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        POLL_SEC,
        () => {
          this._fetch();
          return GLib.SOURCE_CONTINUE;
        },
      );
    }

    /**
     * Fetches user and repository data from GitHub API
     */
    async _fetch() {
      const token = this._settings
        .get_string("set-personal-access-token")
        .trim();
      if (!token) return;

      try {
        const user = await fetchUser(token);
        const limit = this._settings.get_int("set-repositories-limit");
        const repos = await fetchRepos(token, limit);
        this._state.setState({ user, repos, error: null });
      } catch (error) {
        console.error("GitHub API error:", error);
        if (error instanceof InvalidTokenError)
          this._state.setState({
            user: null,
            repos: [],
            error: "Invalid GitHub PAT",
          });
        else this._state.setState({ error: "Network error" });
      }
    }

    _render() {
      const token = this._settings
        .get_string("set-personal-access-token")
        .trim();
      this.menu.removeAll();
      buildMenu(this.menu, this._state.getState(), this._ext.path, {
        openPreferences: () => this._ext.openPreferences(),
        hasToken: !!token,
      });
    }

    destroy() {
      for (const id of this._sigIds) this._settings.disconnect(id);
      this._sigIds = [];

      if (this._pollId) {
        GLib.Source.remove(this._pollId);
        this._pollId = null;
      }

      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }

      super.destroy();
    }
  },
);

export default class GitHubToolsExtension extends Extension {
  enable() {
    this._indicator = new Indicator(this);
    Main.panel.addToStatusArea(this.uuid, this._indicator, 1, "left");
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;
  }
}
