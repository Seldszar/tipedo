const EventEmitter = require("events");

/**
 * A store.
 * @extends {EventEmitter}
 * @param {Array<Layer>} [layers=[]] the layers
 */
class Store extends EventEmitter {
  /**
   * Creates a new store.
   */
  constructor(layers = []) {
    super();

    /**
     * The store layers.
     * @type {Array<Layer>}
     * @private
     */
    this._layers = layers;

    /**
     * The store cache.
     * @type {Map<*, Object>}
     * @private
     */
    this._cache = new Map();

    this._initializeLayers();
    this._initializeCache();
  }

  /**
   * Gets a layer by name.
   * @param {String} name the layer name
   * @return {?Layer} the layer, if exists.
   */
  layer(name) {
    return this._layers.find(layer => layer.name === name);
  }

  /**
   * Returns the value of a node.
   * @param {*} key the node key
   * @return {*} the node value.
   */
  get(key) {
    const cached = this._cache.get(key);

    if (cached) {
      return cached.layer.get(key);
    }

    return undefined;
  }

  /**
   * Indicates if a node exists.
   * @param {*} key the node key
   * @return {Boolean} `true` if the node exists, otherwise `false`.
   */
  has(key) {
    const cached = this._cache.get(key);

    if (cached) {
      return cached.layer.has(key);
    }

    return false;
  }

  /**
   * Calls a function for each store node.
   * @param {Function} callback the function to call
   * @param {*} [context] the context to pass on the function
   */
  forEach(callback, context) {
    this._cache.forEach((cached, key) => {
      callback.call(context, cached.layer.get(key), key);
    });
  }

  /**
   * Returns an iterator listing the node keys.
   * @return {Iterator} the iterator.
   */
  keys() {
    return this._cache.keys();
  }

  /**
   * Returns an iterator listing the node values.
   * @return {Iterator} the iterator.
   */
  *values() {
    for (const [key, cached] of this._cache.entries()) {
      yield cached.layer.get(key);
    }
  }

  /**
   * Returns an iterator listing the node entries.
   * @return {Iterator} the iterator.
   */
  *entries() {
    for (const [key, cached] of this._cache.entries()) {
      yield [key, cached.layer.get(key)];
    }
  }

  /**
   * Returns the store as a JSON compatible.
   * @return {Object} the store.
   */
  toJSON() {
    const nodes = Object.create(null);

    this.forEach((value, key) => {
      nodes[key] = value;
    });

    return { nodes };
  }

  /**
   * Returns the store identity.
   * @return {String} the store identity.
   */
  toString() {
    return "[object Store]";
  }

  /**
   * Returns an iterator listing the node entries.
   * @return {Iterator} the iterator.
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   * Initializes the store layers.
   * @private
   */
  _initializeLayers() {
    for (const [index, layer] of this._layers.entries()) {
      layer.on("change", change => {
        const { type, key } = change;
        const cached = this._cache.get(key);

        if (cached && index > cached.index) {
          return;
        }

        if (type === "delete") {
          this._updateCacheNode(key);
        }

        const oldValue = type === "add" ? this.get(key) : change.oldValue;
        const newValue = type === "delete" ? this.get(key) : change.newValue;

        if (type === "add" || type === "update") {
          this._updateCacheNode(key);
        }

        this.emit("change", { key, oldValue, newValue });
      });
    }
  }

  /**
   * Initializes the store cache.
   * @private
   */
  _initializeCache() {
    for (const [index, layer] of this._layers.entries()) {
      for (const [key, value] of layer.entries()) {
        if (this._cache.has(key)) {
          continue;
        }

        this._cache.set(key, { layer, index });
      }
    }
  }

  /**
   * Updates a node from the store cache.
   * @private
   * @param {*} key the key of the node to update
   */
  _updateCacheNode(key) {
    this._cache.delete(key);

    for (const [index, layer] of this._layers.entries()) {
      if (layer.has(key)) {
        return this._cache.set(key, { layer, index });
      }
    }
  }
}

module.exports = Store;
