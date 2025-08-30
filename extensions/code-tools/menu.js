import Gio from "gi://Gio";
import Pango from "gi://Pango";
import St from "gi://St";

import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Util from "resource:///org/gnome/shell/misc/util.js";

import { getIcon, getViewPath } from "./utils.js";

/**
 * Builds one workspace row with icon and truncated label
 * @param {object} row normalized workspace row
 * @param {string} extPath extension path for icon resolution
 * @returns {PopupMenu.PopupBaseMenuItem} menu row item
 */
function makeRow(row, extPath) {
  const item = new PopupMenu.PopupBaseMenuItem({
    reactive: true,
    can_focus: true,
    style_class: "code-tools-row",
  });

  const box = new St.BoxLayout({
    x_expand: true,
    y_expand: false,
  });

  const iconName = row.git ? "git-symbolic.svg" : "folder-symbolic.svg";
  const icon = new St.Icon({
    gicon: getIcon(extPath, iconName),
    style_class: "code-tools-icon",
  });

  const text = new St.Label({
    text: row.name,
    x_expand: true,
    style_class: "code-tools-text",
  });

  text.clutter_text.single_line_mode = true;
  text.clutter_text.ellipsize = Pango.EllipsizeMode.END;

  box.add_child(icon);
  box.add_child(text);
  item.add_child(box);

  item.connect("activate", () => {
    // Let VSCode decide whether to focus an existing window or open a new one
    Util.spawn(["code", row.path]);
  });

  return item;
}

/**
 * Adds non-reactive empty state row to menu
 * @param {PopupMenu.PopupMenu} menu target popup menu
 */
function addEmpty(menu) {
  const row = new PopupMenu.PopupMenuItem(_("No recent workspaces"), {
    reactive: false,
    can_focus: false,
  });

  menu.addMenuItem(row);
}

/**
 * Adds View All action that opens configured folder in file manager
 * @param {PopupMenu.PopupMenu} menu target popup menu
 * @param {Gio.Settings} settings extension settings
 */
function addView(menu, settings) {
  const view = new PopupMenu.PopupMenuItem(_("View All"));
  view.connect("activate", () => {
    const path = getViewPath(settings);
    const uri = Gio.File.new_for_path(path).get_uri();
    Gio.AppInfo.launch_default_for_uri(uri, null);
  });

  menu.addMenuItem(view);
}

/**
 * Adds Settings action that opens extension preferences
 * @param {PopupMenu.PopupMenu} menu target popup menu
 * @param {Function} openPreferences callback to open preferences
 */
function addSettings(menu, openPreferences) {
  const row = new PopupMenu.PopupMenuItem(_("Settings"));
  row.connect("activate", () => openPreferences?.());
  menu.addMenuItem(row);
}

/**
 * Renders complete popup content from current state
 * @param {PopupMenu.PopupMenu} menu target popup menu
 * @param {Array<object>} rows visible workspace rows
 * @param {Gio.Settings} settings extension settings
 * @param {string} extPath extension path for local icons
 * @param {object} actions external callbacks
 */
export function buildMenu(menu, rows, settings, extPath, actions = {}) {
  const { openPreferences } = actions;

  if (rows.length === 0) {
    addEmpty(menu);
  } else {
    for (const row of rows) menu.addMenuItem(makeRow(row, extPath));
  }

  menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
  addView(menu, settings);
  addSettings(menu, openPreferences);
}
