const EventEmitter = require("events");

/**
 * A layer.
 * @extends {EventEmitter}
 * @param {String} name the layer name
 * @param {Object} [iterable={}] the layer values
 */
class Layer extends EventEmitter {
  /**
   * Creates a new layer.
   */
  constructor(name, iterable = {}) {
    super();

    /**
     * The layer name.
     * @type {String}
     */
    this.name = name;

    /**
     * The layer nodes.
     * @type {Map}
     * @private
     */
    this._nodes = new Map(Object.entries(iterable));
  }

  /**
   * Returns the value of a node.
   * @param {*} key the node key
   * @return {*} the node value.
   */
  get(key) {
    return this._nodes.get(key);
  }

  /**
   * Indicates if a node exists.
   * @param {*} key the node key
   * @return {Boolean} `true` if the node exists, otherwise `false`.
   */
  has(key) {
    return this._nodes.has(key);
  }

  /**
   * Updates a node.
   * @param {*} key the node key
   * @param {*} value the node value
   * @return {Layer} the layer.
   */
  set(key, value) {
    const oldValue = this._nodes.get(key);
    const type = this._nodes.has(key) ? "update" : "add";

    this._nodes.set(key, value);
    this._emitChange(type, key, oldValue, value);

    return this;
  }

  /**
   * Removes a node.
   * @param {*} key the node key
   * @return {Boolean} `true` if the node has been removed, otherwise `false`.
   */
  delete(key) {
    const oldValue = this._nodes.get(key);
    let result;

    if ((result = this._nodes.delete(key))) {
      this._emitChange("delete", key, oldValue);
    }

    return result;
  }

  /**
   * Clears the nodes.
   */
  clear() {
    for (const key of this._nodes.keys()) {
      this.delete(key);
    }
  }

  /**
   * Calls a function for each store node.
   * @param {Function} callback the function to call
   * @param {*} [context] the context to pass on the function
   */
  forEach(callback, context) {
    this._nodes.forEach(callback, context);
  }

  /**
   * Returns an iterator listing the node keys.
   * @return {Iterator} the iterator.
   */
  keys() {
    return this._nodes.keys();
  }

  /**
   * Returns an iterator listing the node values.
   * @return {Iterator} the iterator.
   */
  values() {
    return this._nodes.values();
  }

  /**
   * Returns an iterator listing the node entries.
   * @return {Iterator} the iterator.
   */
  entries() {
    return this._nodes.entries();
  }

  /**
   * Returns the layer as a JSON compatible.
   * @return {Object} the layer.
   */
  toJSON() {
    const { name } = this;
    const nodes = Object.create(null);

    this.forEach((value, key) => {
      nodes[key] = value;
    });

    return { name, nodes };
  }

  /**
   * Returns the layer identity.
   * @return {String} the layer identity.
   */
  toString() {
    return "[object Layer]";
  }

  /**
   * Returns an iterator listing the node entries.
   * @return {Iterator} the iterator.
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /** @private */
  _emitChange(type, key, oldValue, newValue) {
    const change = { type, key };

    if (type === "delete" || type === "update") {
      change.oldValue = oldValue;
    }

    if (type === "add" || type === "update") {
      change.newValue = newValue;
    }

    this.emit("change", change);
  }
}

module.exports = Layer;
