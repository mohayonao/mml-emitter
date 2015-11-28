import assert from "power-assert";
import index from "../src";
import MMLEmitter from "../src/MMLEmitter";

describe("index", () => {
  it("exports", () => {
    assert(index === MMLEmitter);
  });
});
