import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const MIN_LIMIT = 1;
const MAX_LIMIT = 10;

/**
 * Clamps limit value to valid range
 * @param {number} value input value
 * @returns {number} clamped value
 */
function clampLimit(value) {
  return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, value));
}

/**
 * Creates password entry row for GitHub PAT
 * @param {Gio.Settings} settings extension settings
 * @returns {Adw.PasswordEntryRow} preferences row
 */
function makeToken(settings) {
  const row = new Adw.PasswordEntryRow({
    title: _("GitHub Personal Access Token"),
  });

  row.set_text(settings.get_string("set-personal-access-token"));
  row.connect("notify::text", () =>
    settings.set_string("set-personal-access-token", row.get_text().trim()),
  );

  return row;
}

/**
 * Creates spin row for repositories limit
 * @param {Gio.Settings} settings extension settings
 * @returns {Adw.SpinRow} preferences row
 */
function makeLimit(settings) {
  const row = new Adw.SpinRow({
    title: _("Repositories Limit"),
    subtitle: _("Number of recent repositories shown in the menu"),
    adjustment: new Gtk.Adjustment({
      lower: MIN_LIMIT,
      upper: MAX_LIMIT,
      step_increment: 1,
      page_increment: 1,
      value: clampLimit(settings.get_int("set-repositories-limit")),
    }),
  });

  settings.bind(
    "set-repositories-limit",
    row,
    "value",
    Gio.SettingsBindFlags.DEFAULT,
  );

  row.connect("notify::value", () =>
    settings.set_int("set-repositories-limit", clampLimit(row.get_value())),
  );

  return row;
}

export default class GitHubToolsPrefs extends ExtensionPreferences {
  /**
   * Builds preferences window with settings controls
   * @param {Adw.PreferencesWindow} window target window
   */
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: _("GitHub Settings"),
    });

    group.add(makeToken(settings));
    group.add(makeLimit(settings));
    page.add(group);
  }
}
