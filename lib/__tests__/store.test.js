const Layer = require("../layer");
const Store = require("../store");

describe("Store", () => {
  let store;

  beforeEach(() => {
    store = new Store([
      new Layer("lorem", {
        lorem: "from lorem",
      }),
      new Layer("ipsum", {
        lorem: "from ipsum",
        ipsum: "from ipsum",
      }),
    ]);
  });

  test("should return an empty store", () => {
    expect(new Store()).toMatchSnapshot();
  });

  test("should return the `lorem` node", () => {
    expect(store.get("lorem")).toBe("from lorem");
  });

  test("should return `true` if a node exists", () => {
    expect(store.has("lorem")).toBe(true);
  });

  test("should return `false` if a node doesn't exist", () => {
    expect(store.has("amet")).toBe(false);
  });

  test("should include the nodes from the `lorem` layer", () => {
    const layer = store.layer("ipsum");
    const callback = jest.fn();

    store.on("change", callback);
    layer.clear();

    expect(callback).toHaveBeenCalled();
    expect([...store.keys()]).toMatchSnapshot();
  });

  test("should not emit a `change` event if a lower layer updates the same node as the higher one", () => {
    const layer = store.layer("ipsum");
    const callback = jest.fn();

    store.on("change", callback);
    layer.set("lorem", "from ipsum");

    expect(callback).not.toHaveBeenCalled();
    expect(store.get("lorem")).toBe("from lorem");
  });

  test("should emit a `change` event if a higher layer updates the same node as the lower one", () => {
    const layer = store.layer("lorem");
    const callback = jest.fn();

    store.on("change", callback);
    layer.set("ipsum", "from lorem");

    expect(callback).toHaveBeenCalled();
    expect(store.get("ipsum")).toBe("from lorem");
  });

  test("should walk through the store and return the nodes", () => {
    const callback = jest.fn();

    store.forEach(callback);

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls).toMatchSnapshot();
  });

  test("should return the keys", () => {
    expect([...store.keys()]).toMatchSnapshot();
  });

  test("should return the values", () => {
    expect([...store.values()]).toMatchSnapshot();
  });

  test("should return the entries", () => {
    expect([...store.entries()]).toMatchSnapshot();
  });

  test("should return the JSON compatible object", () => {
    expect(store.toJSON()).toMatchSnapshot();
  });

  test("should return the identity", () => {
    expect(store.toString()).toMatchSnapshot();
  });

  test("should return an iterator", () => {
    const iterator = store[Symbol.iterator]();

    expect(iterator).toBeInstanceOf(Object);
    expect(iterator.next).toBeInstanceOf(Function);
  });
});
