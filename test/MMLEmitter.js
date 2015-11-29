import assert from "power-assert";
import sinon from "sinon";
import tickable from "tickable-timer";
import MMLEmitter from "../src/MMLEmitter";
import _pick from "lodash.pick";

function noteEvent(playbackTime, trackNumber, time, noteNumber) {
  return { type: "note", playbackTime, trackNumber, time, noteNumber };
}

function pick(target) {
  return _pick(target, [ "type", "playbackTime", "trackNumber", "time", "noteNumber" ]);
}

describe("MMLEmitter", () => {
  let BuiltInDate = Date;
  let timestamp = 0;

  before(() => {
    BuiltInDate = global.Date;

    global.Date = {
      now() {
        return timestamp;
      }
    };
  });
  beforeEach(() => {
    timestamp = 0;
    tickable.clearAllTimers();
    tickable.removeAllListeners();
    tickable.on("tick", (tick) => {
      timestamp += tick;
    });
  });
  after(() => {
    global.Date = BuiltInDate;
  });

  describe("constructor(source: string, config = {})", () => {
    it("works", () => {
      let emitter = new MMLEmitter("");

      assert(emitter instanceof MMLEmitter);
    });
  });
  describe("#start(): void", () => {
    it("works", () => {
      let emitter = new MMLEmitter("", { timerAPI: tickable });

      assert.doesNotThrow(() => {
        emitter.start();
      });
    });
  });
  describe("#stop(): void", () => {
    it("works", () => {
      let emitter = new MMLEmitter("", { timerAPI: tickable });

      assert.doesNotThrow(() => {
        emitter.stop();
      });
    });
  });
  describe("emit", () => {
    it("ceg; l8 <aaarg", () => {
      let emitter = new MMLEmitter("ceg; l8 <aaarg", { timerAPI: tickable, interval: 0.25 });
      let onNote = sinon.spy();
      let onEnd = sinon.spy();

      tickable.tick(1000);
      emitter.on("note", onNote);
      emitter.on("end", onEnd);
      emitter.start();

      tickable.tick(250);
      assert(onNote.callCount === 3);
      assert(onEnd.callCount === 0);
      assert.deepEqual(pick(onNote.args[0][0]), noteEvent(1.000, 0, 0.000, 60));
      assert.deepEqual(pick(onNote.args[1][0]), noteEvent(1.000, 1, 0.000, 57));
      assert.deepEqual(pick(onNote.args[2][0]), noteEvent(1.250, 1, 0.250, 57));
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 2);
      assert(onEnd.callCount === 0);
      assert.deepEqual(pick(onNote.args[0][0]), noteEvent(1.500, 0, 0.500, 64));
      assert.deepEqual(pick(onNote.args[1][0]), noteEvent(1.500, 1, 0.500, 57));
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 0);
      assert(onEnd.callCount === 0);
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 2);
      assert(onEnd.callCount === 0);
      assert.deepEqual(pick(onNote.args[0][0]), noteEvent(2.000, 0, 1.000, 67));
      assert.deepEqual(pick(onNote.args[1][0]), noteEvent(2.000, 1, 1.000, 55));
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 0);
      assert(onEnd.callCount === 0);
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 0);
      assert(onEnd.callCount === 1);
      assert.deepEqual(onEnd.args[0][0], { type: "end", playbackTime: 2.5 });
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 0);
      assert(onEnd.callCount === 0);
    });
  });
});
