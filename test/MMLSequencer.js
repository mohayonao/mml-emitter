import assert from "power-assert";
import MMLSequencer from "../src/MMLSequencer";

function createIterator(list) {
  return list.map((time) => { return { time: time, duration: 2 }; })[Symbol.iterator]();
}

describe("MMLSequencer", () => {
  describe("constructor(iter: Iterator, interval: number)", () => {
    it("works", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 0.5);

      assert(iter instanceof MMLSequencer);
    });
  });
  describe("#next(): { done: boolean, value: object }", () => {
    it("works with interval: 4.0", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 4.0);

      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 0.0, duration: 2 }, { time: 1.0, duration: 2 }, { time: 1.5, duration: 2 }, { time: 2.0, duration: 2 } ]
      }, "0.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 4.0, duration: 2 } ]
      }, "4.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 8.0, duration: 2 } ]
      }, "8.00");
      assert.deepEqual(iter.next(), {
        done: true, value: []
      }, "12.00");
    });
    it("works with interval: 2.0", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 2.0);

      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 0.0, duration: 2 }, { time: 1.0, duration: 2 }, { time: 1.5, duration: 2 } ]
      }, "0.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 2.0, duration: 2 } ]
      }, "2.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 4.0, duration: 2 } ]
      }, "4.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 8.0, duration: 2 } ]
      }, "8.00");
      assert.deepEqual(iter.next(), {
        done: true, value: []
      }, "10.00");
    });
    it("works with interval: 1.0", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 1.0);

      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 0.0, duration: 2 } ]
      }, "0.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 1.0, duration: 2 }, { time: 1.5, duration: 2 } ]
      }, "1.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 2.0, duration: 2 } ]
      }, "2.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 4.0, duration: 2 } ]
      }, "4.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 8.0, duration: 2 } ]
      }, "8.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.00");
      assert.deepEqual(iter.next(), {
        done: true, value: []
      }, "10.00");
    });
    it("works with interval: 0.5", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 0.5);

      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 0.0, duration: 2 } ]
      }, "0.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "0.50");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 1.0, duration: 2 } ]
      }, "1.00");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 1.5, duration: 2 } ]
      }, "1.50");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 2.0, duration: 2 } ]
      }, "2.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "2.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.50");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 4.0, duration: 2 } ]
      }, "4.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "4.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.50");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 8.0, duration: 2 } ]
      }, "8.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "8.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.50");
      assert.deepEqual(iter.next(), {
        done: true, value: []
      }, "10.00");
    });
    it("works with interval: 0.25", () => {
      let iter = new MMLSequencer(createIterator([ 0, 1, 1.5, 2, 4, 8 ]), 0.25);

      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 0.0, duration: 2 } ]
      }, "0.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "0.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "0.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "0.75");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 1.0, duration: 2 } ]
      }, "1.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "1.25");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 1.5, duration: 2 } ]
      }, "1.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "1.75");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 2.0, duration: 2 } ]
      }, "2.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "2.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "2.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "2.75");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "3.75");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 4.0, duration: 2 } ]
      }, "4.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "4.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "4.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "4.75");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "5.75");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "6.75");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "7.75");
      assert.deepEqual(iter.next(), {
        done: false, value: [ { time: 8.0, duration: 2 } ]
      }, "8.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "8.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "8.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "8.75");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.00");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.25");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.50");
      assert.deepEqual(iter.next(), {
        done: false, value: []
      }, "9.75");
      assert.deepEqual(iter.next(), {
        done: true, value: []
      }, "10.00");
    });
  });
});
