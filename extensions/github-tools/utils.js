import Gio from "gi://Gio";

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
 * Determines which icon to display for a repository based on its relationship to the user
 * @param {object} repo normalized repository object
 * @param {string} userLogin authenticated user login
 * @returns {string} icon filename
 */
export function getRepoIcon(repo, userLogin) {
  if (repo.fork) return "repo-forked-symbolic.svg";
  if (repo.owner.login === userLogin) return "repo-owner-symbolic.svg";
  return "repo-collaborator-symbolic.svg";
}
