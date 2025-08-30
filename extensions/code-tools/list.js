import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";

import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { listAll, removeWorkspace } from "./utils.js";

const EMPTY_TEXT = "No recent workspaces";

/**
 * Resolves row icon path by git state
 * @param {string} extPath extension path
 * @param {boolean} git git state
 * @returns {string} icon absolute path
 */
function iconPath(extPath, git) {
  const icon = git ? "git-symbolic.svg" : "folder-symbolic.svg";
  return `${extPath}/icons/${icon}`;
}

/**
 * Builds image widget from extension icon path
 * @param {string} path icon absolute path
 * @returns {Gtk.Image} image widget
 */
function makeIcon(path) {
  return new Gtk.Image({
    gicon: Gio.Icon.new_for_string(path),
    pixel_size: 16,
  });
}

/**
 * Builds remove button used by preferences list rows
 * @param {string} extPath extension path
 * @returns {Gtk.Button} remove button
 */
function makeRemove(extPath) {
  return new Gtk.Button({
    child: makeIcon(`${extPath}/icons/remove-symbolic.svg`),
    valign: Gtk.Align.CENTER,
    tooltip_text: _("Remove"),
    css_classes: ["flat"],
  });
}

/**
 * Builds one preferences row with remove action
 * @param {string} extPath extension path
 * @param {object} row normalized workspace row
 * @param {Gio.Settings} settings extension settings
 * @param {Function} onChange rerender callback
 * @returns {Adw.ActionRow} configured list row
 */
function makeRow(extPath, row, settings, onChange) {
  const item = new Adw.ActionRow({
    title: row.name,
    subtitle: row.path,
  });

  item.add_prefix(makeIcon(iconPath(extPath, row.git)));

  const remove = makeRemove(extPath);
  remove.connect("clicked", () => {
    removeWorkspace(settings, row.path);
    onChange();
  });

  item.add_suffix(remove);
  item.set_activatable_widget(remove);
  return item;
}

/**
 * Mounts live workspace list into preferences group
 * @param {Adw.PreferencesGroup} group target group
 * @param {Gio.Settings} settings extension settings
 * @param {string} extPath extension path
 * @param {Function} onChange external refresh notifier
 * @returns {Function} rerender function
 */
export function buildList(group, settings, extPath, onChange) {
  const rows = [];

  function clear() {
    for (const row of rows) group.remove(row);
    rows.length = 0;
  }

  function render() {
    clear();

    // Removed rows are hidden immediately so prefs matches menu visibility
    const data = listAll(settings).filter((row) => !row.removed);
    if (data.length === 0) {
      const empty = new Adw.ActionRow({
        title: _(EMPTY_TEXT),
      });

      group.add(empty);
      rows.push(empty);
      return;
    }

    for (const row of data) {
      const item = makeRow(extPath, row, settings, render);
      group.add(item);
      rows.push(item);
    }

    onChange();
  }

  render();
  return render;
}
