const Layer = require("../layer");

describe("Layer", () => {
  let layer;

  beforeEach(() => {
    layer = new Layer("lorem", {
      lorem: "from lorem",
    });
  });

  test("should return an empty layer", () => {
    expect(new Layer("lorem")).toMatchSnapshot();
  });

  test("should return the `lorem` node", () => {
    expect(layer.get("lorem")).toMatchSnapshot();
  });

  test("should indicate if the `lorem` node exists", () => {
    expect(layer.has("lorem")).toMatchSnapshot();
  });

  test("should return `true` if the node exists", () => {
    expect(layer.delete("lorem")).toMatchSnapshot();
  });

  test("should return `false` if the node doesn't exist", () => {
    expect(layer.delete("ipsum")).toMatchSnapshot();
  });

  test("should clear the layer", () => {
    layer.clear();

    expect(layer).toMatchSnapshot();
  });

  test("should walk through the layer and return the nodes", () => {
    const callback = jest.fn();

    layer.forEach(callback);

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls).toMatchSnapshot();
  });

  test("should return the keys", () => {
    expect([...layer.keys()]).toMatchSnapshot();
  });

  test("should return the values", () => {
    expect([...layer.values()]).toMatchSnapshot();
  });

  test("should return the entries", () => {
    expect([...layer.entries()]).toMatchSnapshot();
  });

  test("should return the JSON compatible object", () => {
    expect(layer.toJSON()).toMatchSnapshot();
  });

  test("should return the identity", () => {
    expect(layer.toString()).toMatchSnapshot();
  });

  test("should return an iterator", () => {
    const iterator = layer[Symbol.iterator]();

    expect(iterator).toBeInstanceOf(Object);
    expect(iterator.next).toBeInstanceOf(Function);
  });
});
