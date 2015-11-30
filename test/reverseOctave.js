import assert from "power-assert";
import reverseOctave from "../src/reverseOctave";

describe("reverseOctave(source: string): string", () => {
  it("works", () => {
    assert(reverseOctave("a<b>c") === "a>b<c");
  });
});
