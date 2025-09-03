import Soup from "gi://Soup?version=3.0";
import GLib from "gi://GLib";

const API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

let session = null;

/**
 * Returns shared Soup session for all requests
 * @returns {Soup.Session} HTTP session
 */
function getSession() {
  if (!session) {
    session = new Soup.Session();
    session.user_agent = "github-tools/1.0";
  }
  return session;
}

/**
 * Base error class for GitHub API errors
 */
class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Error thrown when GitHub PAT is invalid or lacks permissions
 */
class InvalidTokenError extends APIError {
  constructor() {
    super("Invalid GitHub PAT");
    this.name = "InvalidTokenError";
  }
}

/**
 * Error thrown for network or HTTP failures
 */
class NetworkError extends APIError {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Builds required GitHub API headers for authentication
 * @param {string} token GitHub PAT
 * @returns {object} headers object
 */
function makeHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
  };
}

/**
 * Makes authenticated GET request to GitHub API
 * @param {string} url full API URL
 * @param {string} token GitHub PAT
 * @returns {Promise<object>} parsed JSON response
 */
async function request(url, token) {
  const sess = getSession();
  const message = Soup.Message.new("GET", url);
  const headers = makeHeaders(token);

  for (const [key, value] of Object.entries(headers)) {
    message.request_headers.append(key, value);
  }

  try {
    const bytes = await new Promise((resolve, reject) => {
      sess.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null,
        (session, result) => {
          try {
            resolve(session.send_and_read_finish(result));
          } catch (error) {
            reject(error);
          }
        },
      );
    });

    if (message.status_code === 401) {
      throw new InvalidTokenError();
    }

    if (message.status_code !== 200) {
      throw new NetworkError(`HTTP ${message.status_code}`);
    }

    const data = bytes.get_data();
    const text = new TextDecoder().decode(data);
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError(error.message);
  }
}

/**
 * Fetches authenticated user information from GitHub
 * @param {string} token GitHub PAT
 * @returns {Promise<object>} normalized user object
 */
export async function fetchUser(token) {
  const url = `${API_BASE}/user`;
  const data = await request(url, token);

  return {
    login: data.login,
    html_url: data.html_url,
  };
}

/**
 * Fetches repositories accessible to authenticated user
 * @param {string} token GitHub PAT
 * @param {number} limit maximum repositories to return
 * @returns {Promise<Array>} normalized repository array
 */
export async function fetchRepos(token, limit = 10) {
  const url = `${API_BASE}/user/repos?sort=updated&per_page=${limit}&affiliation=owner,collaborator`;
  const data = await request(url, token);

  return data.map((repo) => ({
    name: repo.name,
    html_url: repo.html_url,
    owner: {
      login: repo.owner.login,
    },
    fork: repo.fork,
    permissions: repo.permissions
      ? {
          pull: repo.permissions.pull,
          push: repo.permissions.push,
          admin: repo.permissions.admin,
        }
      : null,
  }));
}

export { InvalidTokenError, NetworkError, APIError };
