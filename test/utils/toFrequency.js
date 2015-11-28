import assert from "power-assert";
import toFrequency from "../../src/utils/toFrequency";

function closeTo(expected, actual, delta) {
  return Math.abs(expected - actual) <= delta;
}

describe("toFrequency(noteNumber: number, a4Index: number, a4Frequency: number): number", () => {
  it("works", () => {
    assert(closeTo(toFrequency(60, 69, 440), 261.625565300, 1e-6));
    assert(closeTo(toFrequency(62, 69, 440), 293.664767917, 1e-6));
    assert(closeTo(toFrequency(64, 69, 440), 329.627556912, 1e-6));
    assert(closeTo(toFrequency(65, 69, 440), 349.228231433, 1e-6));
    assert(closeTo(toFrequency(67, 69, 440), 391.995435981, 1e-6));
    assert(closeTo(toFrequency(69, 69, 440), 440.000000000, 1e-6));
    assert(closeTo(toFrequency(71, 69, 440), 493.883301256, 1e-6));
  });
});
