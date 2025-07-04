import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Shell from "gi://Shell";
import St from "gi://St";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

import { buildMenu } from "./menu.js";
import { discover, listAll, restoreWorkspace } from "./utils.js";

const POLL_SEC = 60;

/**
 * Collects visible workspace-like names from open VSCode windows
 * @returns {Set<string>} lowercased window titles
 */
function readOpenNames() {
  const names = new Set();
  const tracker = Shell.WindowTracker.get_default();

  for (const actor of global.get_window_actors()) {
    const win = actor.metaWindow;
    if (!win) continue;

    const app = tracker.get_window_app(win);
    const id = app?.get_id()?.toLowerCase() ?? "";
    if (!id.includes("code")) continue;

    const title = win.get_title()?.toLowerCase() ?? "";
    if (!title) continue;

    names.add(title);
  }

  return names;
}

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(ext) {
      super._init(0.5, _("Workspaces"), false);

      this.ext = ext;
      this.settings = ext.getSettings();
      this.rows = [];
      this.pollId = null;
      this.sigIds = [];

      this.box = new St.BoxLayout({
        style_class: "code-tools-box",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.label = new St.Label({
        text: _("Workspaces"),
        style_class: "code-tools-label",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.box.add_child(this.label);
      this.add_child(this.box);

      this.sigIds.push(
        this.settings.connect("changed::set-workspaces-limit", () => {
          this.scan();
        }),
      );

      this.sigIds.push(
        this.settings.connect("changed::set-remove-workspaces", () => {
          this.scan();
        }),
      );

      this.sigIds.push(
        this.settings.connect("changed::set-workspaces-folder", () => {
          this.render();
        }),
      );

      this.scan();
      this.pollId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        POLL_SEC,
        () => {
          this.scan();
          return GLib.SOURCE_CONTINUE;
        },
      );
    }

    scan() {
      const names = readOpenNames();
      for (const row of listAll(this.settings)) {
        // Auto restore previously hidden workspaces when VSCode reopens them
        if (!row.removed) continue;

        const name = row.name.toLowerCase();
        if ([...names].some((title) => title.includes(name))) {
          restoreWorkspace(this.settings, row.path);
        }
      }

      const limit = this.settings.get_int("set-workspaces-limit");
      this.rows = discover(this.settings, limit);
      this.render();
    }

    render() {
      this.menu.removeAll();
      buildMenu(this.menu, this.rows, this.settings, this.ext.path, {
        openPreferences: () => this.ext.openPreferences(),
      });
    }

    destroy() {
      for (const id of this.sigIds) this.settings.disconnect(id);
      this.sigIds = [];

      if (this.pollId) {
        GLib.Source.remove(this.pollId);
        this.pollId = null;
      }

      super.destroy();
    }
  },
);

export default class CodeToolsExtension extends Extension {
  enable() {
    this.ind = new Indicator(this);
    Main.panel.addToStatusArea(this.uuid, this.ind, 1, "left");
  }

  disable() {
    this.ind?.destroy();
    this.ind = null;
  }
}
