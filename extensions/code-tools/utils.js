import Gio from "gi://Gio";
import GLib from "gi://GLib";

const STORAGE_PATH = GLib.build_filenamev([
  GLib.get_home_dir(),
  ".config",
  "Code",
  "User",
  "workspaceStorage",
]);

/**
 * Extracts local filesystem path from workspace.json content
 * @param {string} text workspace.json string payload
 * @returns {string | null} absolute local path
 */
function readFolder(text) {
  const match = text.match(/"folder"\s*:\s*"([^"]+)"/);
  if (!match) return null;

  const uri = match[1];
  if (!uri.startsWith("file://")) return null;

  const path = decodeURIComponent(uri.replace("file://", ""));
  const file = Gio.File.new_for_path(path);
  return file.query_exists(null) ? path : null;
}

/**
 * Reads one workspace.json and returns local path when available
 * @param {Gio.File} file workspace.json file object
 * @returns {string | null} absolute local path
 */
function readWorkspace(file) {
  const [ok, bytes] = file.load_contents(null);
  if (!ok) return null;

  const text = new TextDecoder().decode(bytes);
  return readFolder(text);
}

function hasGit(path) {
  const gitPath = GLib.build_filenamev([path, ".git"]);
  return Gio.File.new_for_path(gitPath).query_exists(null);
}

/**
 * Scans VSCode storage and returns normalized local workspaces by recency
 * @returns {Array<object>} normalized workspace rows
 */
function scanStorage() {
  const list = [];
  const root = Gio.File.new_for_path(STORAGE_PATH);
  if (!root.query_exists(null)) return list;

  const enumr = root.enumerate_children(
    "standard::name,standard::type,time::modified",
    Gio.FileQueryInfoFlags.NONE,
    null,
  );

  let info;
  while ((info = enumr.next_file(null)) !== null) {
    if (info.get_file_type() !== Gio.FileType.DIRECTORY) continue;

    const key = info.get_name();
    const jsonPath = GLib.build_filenamev([
      STORAGE_PATH,
      key,
      "workspace.json",
    ]);
    const file = Gio.File.new_for_path(jsonPath);
    if (!file.query_exists(null)) continue;

    const path = readWorkspace(file);
    if (!path) continue;

    const time = info.get_modification_date_time().to_unix();
    list.push({
      path,
      name: GLib.path_get_basename(path),
      git: hasGit(path),
      time,
    });
  }

  enumr.close(null);
  list.sort((a, b) => b.time - a.time);
  return list;
}

/**
 * Reads hidden workspace paths from settings
 * @param {Gio.Settings} settings extension settings
 * @returns {Set<string>} removed workspace path set
 */
function readRemoved(settings) {
  return new Set(settings.get_strv("set-remove-workspaces"));
}

/**
 * Resolves extension icon file into a gicon consumable by shell widgets
 * @param {string} extPath extension root path
 * @param {string} iconName icon file name
 * @returns {Gio.Icon} icon handle
 */
export function getIcon(extPath, iconName) {
  return Gio.Icon.new_for_string(`${extPath}/icons/${iconName}`);
}

/**
 * Resolves folder used by View All with safe home fallback
 * @param {Gio.Settings} settings extension settings
 * @returns {string} existing folder path
 */
export function getViewPath(settings) {
  const path = settings.get_string("set-workspaces-folder").trim();
  if (!path) return GLib.get_home_dir();

  const file = Gio.File.new_for_path(path);
  return file.query_exists(null) ? path : GLib.get_home_dir();
}

/**
 * Returns visible rows for panel menu after remove-filter and limit
 * @param {Gio.Settings} settings extension settings
 * @param {number} max requested menu limit
 * @returns {Array<object>} visible rows
 */
export function discover(settings, max = 10) {
  const size = Math.max(1, Math.min(10, max));
  const removed = readRemoved(settings);
  const rows = [];

  for (const row of scanStorage()) {
    if (removed.has(row.path)) continue;

    rows.push(row);
    if (rows.length >= size) break;
  }

  return rows;
}

/**
 * Returns all discovered rows with removed marker for preferences
 * @param {Gio.Settings} settings extension settings
 * @returns {Array<object>} rows including removed flag
 */
export function listAll(settings) {
  const removed = readRemoved(settings);

  return scanStorage().map((row) => ({
    ...row,
    removed: removed.has(row.path),
  }));
}

/**
 * Persists one removed workspace path
 * @param {Gio.Settings} settings extension settings
 * @param {string} path workspace absolute path
 * @returns {boolean} settings write result
 */
export function removeWorkspace(settings, path) {
  const removed = readRemoved(settings);
  removed.add(path);
  return settings.set_strv("set-remove-workspaces", [...removed].sort());
}

/**
 * Removes one workspace path from hidden list
 * @param {Gio.Settings} settings extension settings
 * @param {string} path workspace absolute path
 * @returns {boolean} settings write result
 */
export function restoreWorkspace(settings, path) {
  const removed = readRemoved(settings);
  if (!removed.delete(path)) return false;

  return settings.set_strv("set-remove-workspaces", [...removed].sort());
}
