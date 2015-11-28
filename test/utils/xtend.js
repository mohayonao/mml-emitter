import assert from "power-assert";
import xtend from "../../src/utils/xtend";

describe("xtend(...args: object): object", () => {
  it("works", () => {
    assert.deepEqual(xtend({ a: 10, b: 20 }, { b: 30, c: 40 }, null), {
      a: 10, b: 30, c: 40
    });
  });
});
