import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { buildList } from "./list.js";

const MIN_LIMIT = 1;
const MAX_LIMIT = 10;

/**
 * Keeps menu limit inside the agreed UX range
 * @param {number} value candidate limit
 * @returns {number} bounded limit
 */
function clampLimit(value) {
  return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, value));
}

function makeFolder(settings) {
  const row = new Adw.EntryRow({
    title: _("Workspaces Folder"),
  });

  row.set_text(settings.get_string("set-workspaces-folder"));
  row.connect("notify::text", () => {
    settings.set_string("set-workspaces-folder", row.get_text().trim());
  });

  return row;
}

/**
 * Builds folder picker button and syncs selected path into settings
 * @param {Adw.PreferencesWindow} window preferences host window
 * @param {Adw.EntryRow} row folder entry row
 * @param {Gio.Settings} settings extension settings
 * @returns {Gtk.Button} configured browse button
 */
function makeBrowse(window, row, settings) {
  const button = new Gtk.Button({
    icon_name: "folder-open-symbolic",
    tooltip_text: _("Browse"),
    css_classes: ["flat"],
    valign: Gtk.Align.CENTER,
  });

  button.connect("clicked", () => {
    const picker = new Gtk.FileChooserNative({
      action: Gtk.FileChooserAction.SELECT_FOLDER,
      title: _("Select Workspaces Folder"),
      modal: true,
      transient_for: window,
    });

    picker.connect("response", (dialog, response) => {
      if (response !== Gtk.ResponseType.ACCEPT) return;

      const file = dialog.get_file();
      if (!file) return;

      const path = file.get_path();
      if (!path) return;

      row.set_text(path);
      settings.set_string("set-workspaces-folder", path);
    });

    picker.show();
  });

  return button;
}

/**
 * Builds workspaces limit row bound to settings
 * @param {Gio.Settings} settings extension settings
 * @returns {Adw.SpinRow} configured limit row
 */
function makeLimit(settings) {
  const row = new Adw.SpinRow({
    title: _("Workspaces Limit"),
    subtitle: _("Number of recent workspaces shown in the menu"),
    adjustment: new Gtk.Adjustment({
      lower: MIN_LIMIT,
      upper: MAX_LIMIT,
      step_increment: 1,
      page_increment: 1,
      value: clampLimit(settings.get_int("set-workspaces-limit")),
    }),
  });

  settings.bind(
    "set-workspaces-limit",
    row,
    "value",
    Gio.SettingsBindFlags.DEFAULT,
  );

  row.connect("notify::value", () => {
    settings.set_int("set-workspaces-limit", clampLimit(row.get_value()));
  });

  return row;
}

export default class CodeToolsPrefs extends ExtensionPreferences {
  /**
   * Builds preferences with settings controls and live workspace list
   * @param {Adw.PreferencesWindow} window preferences host window
   */
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    window.add(page);

    const settingsGroup = new Adw.PreferencesGroup({
      title: _("Workspaces Settings"),
    });

    const folder = makeFolder(settings);
    folder.add_suffix(makeBrowse(window, folder, settings));
    settingsGroup.add(folder);
    settingsGroup.add(makeLimit(settings));
    page.add(settingsGroup);

    const listGroup = new Adw.PreferencesGroup({
      title: _("Workspaces List"),
    });

    page.add(listGroup);
    buildList(listGroup, settings, this.path, () => {});
  }
}
