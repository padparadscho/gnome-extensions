const INITIAL_STATE = {
  user: null,
  repos: [],
  error: null,
};

/**
 * Observable state container with observer pattern
 */
export class State {
  constructor() {
    this._state = {...INITIAL_STATE};
    this._listeners = new Set();
  }

  /**
   * Returns current state snapshot
   * @returns {object} current state
   */
  getState() {
    return {...this._state};
  }

  /**
   * Merges updates into state and notifies all listeners
   * @param {object} updates partial state updates
   */
  setState(updates) {
    this._state = {...this._state, ...updates};
    this._notify();
  }

  /**
   * Registers a listener for state changes
   * @param {Function} listener callback function
   * @returns {Function} unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Notifies all registered listeners of state change
   * @private
   */
  _notify() {
    for (const listener of this._listeners)
      listener();
  }

  /**
   * Resets state to initial values and notifies listeners
   */
  reset() {
    this._state = {...INITIAL_STATE};
    this._notify();
  }
}
