import Gio from "gi://Gio";
import Pango from "gi://Pango";
import St from "gi://St";

import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import { getIcon, getRepoIcon } from "./utils.js";

/**
 * Creates a menu row for a repository with icon and click handler
 * @param {object} repo normalized repository object
 * @param {string} userLogin authenticated user login
 * @param {string} extPath extension root path
 * @returns {PopupMenu.PopupBaseMenuItem} menu item
 */
function makeRepoRow(repo, userLogin, extPath) {
  const item = new PopupMenu.PopupBaseMenuItem({
    reactive: true,
    can_focus: true,
    style_class: "github-tools-row",
  });

  const box = new St.BoxLayout({
    x_expand: true,
    y_expand: false,
  });

  const icon = new St.Icon({
    gicon: getIcon(extPath, getRepoIcon(repo, userLogin)),
    style_class: "github-tools-icon",
  });

  const text = new St.Label({
    text: repo.name,
    x_expand: true,
    style_class: "github-tools-text",
  });

  text.clutter_text.single_line_mode = true;
  text.clutter_text.ellipsize = Pango.EllipsizeMode.END;

  box.add_child(icon);
  box.add_child(text);
  item.add_child(box);

  item.connect("activate", () =>
    Gio.AppInfo.launch_default_for_uri(repo.html_url, null),
  );

  return item;
}

/**
 * Adds empty state row when no repositories are available
 * @param {PopupMenu} menu target menu
 */
function addEmptyState(menu) {
  menu.addMenuItem(
    new PopupMenu.PopupMenuItem(_("No recent repositories"), {
      reactive: false,
      can_focus: false,
    }),
  );
}

/**
 * Adds button row for creating GitHub PAT when none is configured
 * @param {PopupMenu} menu target menu
 */
function addNoTokenState(menu) {
  const row = new PopupMenu.PopupMenuItem(
    _("Create GitHub Personal Access Token"),
    { reactive: true, can_focus: true },
  );
  row.connect("activate", () =>
    Gio.AppInfo.launch_default_for_uri(
      "https://github.com/settings/tokens",
      null,
    ),
  );
  menu.addMenuItem(row);
}

/**
 * Adds loading state row during initial data fetch
 * @param {PopupMenu} menu target menu
 */
function addLoadingState(menu) {
  menu.addMenuItem(
    new PopupMenu.PopupMenuItem(_("Loading..."), {
      reactive: false,
      can_focus: false,
    }),
  );
}

/**
 * Adds error state row with message
 * @param {PopupMenu} menu target menu
 * @param {string} message error message to display
 */
function addErrorState(menu, message) {
  menu.addMenuItem(
    new PopupMenu.PopupMenuItem(_(message), {
      reactive: false,
      can_focus: false,
    }),
  );
}

/**
 * Adds View Profile button that opens user GitHub profile
 * @param {PopupMenu} menu target menu
 * @param {object} user user object with html_url
 */
function addViewProfile(menu, user) {
  const row = new PopupMenu.PopupMenuItem(_("View Profile"));
  row.connect("activate", () => {
    if (user?.html_url) Gio.AppInfo.launch_default_for_uri(user.html_url, null);
  });
  menu.addMenuItem(row);
}

/**
 * Adds Settings button that opens extension preferences
 * @param {PopupMenu} menu target menu
 * @param {Function} openPreferences callback to open preferences
 */
function addSettings(menu, openPreferences) {
  const row = new PopupMenu.PopupMenuItem(_("Settings"));
  row.connect("activate", () => openPreferences());
  menu.addMenuItem(row);
}

/**
 * Builds complete menu based on current state
 * @param {PopupMenu} menu target menu
 * @param {object} state extension state object
 * @param {string} extPath extension root path
 * @param {object} actions action callbacks
 * @param {Function} actions.openPreferences callback to open preferences
 * @param {boolean} actions.hasToken whether PAT is configured
 */
export function buildMenu(menu, state, extPath, actions) {
  const { user, repos, error } = state;
  const { openPreferences, hasToken } = actions;

  if (error) addErrorState(menu, error);
  else if (!hasToken) addNoTokenState(menu);
  else if (!user) addLoadingState(menu);
  else if (repos.length === 0) addEmptyState(menu);
  else
    for (const repo of repos)
      menu.addMenuItem(makeRepoRow(repo, user.login, extPath));

  menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
  addViewProfile(menu, user);
  addSettings(menu, openPreferences);
}
