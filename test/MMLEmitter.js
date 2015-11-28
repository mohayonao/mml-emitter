import assert from "power-assert";
import sinon from "sinon";
import tickable from "tickable-timer";
import MMLEmitter from "../src/MMLEmitter";
import toFrequency from "../src/utils/toFrequency";

function createNoteEvent(playbackTime, trackNumber, noteNumber, duration) {
  return {
    type: "note",
    playbackTime: playbackTime,
    trackNumber: trackNumber,
    noteNumber: noteNumber,
    frequency: toFrequency(noteNumber, 69, 440),
    duration: duration,
    gateTime: duration * 0.75,
    volume: 0.75
  };
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
  describe("#start(): self", () => {
    it("works", () => {
      let emitter = new MMLEmitter("", { timerAPI: tickable });

      assert(emitter.start() === emitter);
    });
  });
  describe("#stop(): self", () => {
    it("works", () => {
      let emitter = new MMLEmitter("", { timerAPI: tickable });

      assert(emitter.stop() === emitter);
    });
  });
  describe("emit", () => {
    it("ceg; l8 >aaarg", () => {
      let emitter = new MMLEmitter("ceg; l8 >aaarg", { timerAPI: tickable });
      let onNote = sinon.spy();
      let onEnd = sinon.spy();

      tickable.tick(1000);
      emitter.on("note", onNote);
      emitter.on("end", onEnd);
      emitter.start();

      tickable.tick(250);
      assert(onNote.callCount === 3);
      assert(onEnd.callCount === 0);
      assert.deepEqual(onNote.args[0], [ createNoteEvent(1.000, 0, 72, 0.50) ]);
      assert.deepEqual(onNote.args[1], [ createNoteEvent(1.000, 1, 69, 0.25) ]);
      assert.deepEqual(onNote.args[2], [ createNoteEvent(1.250, 1, 69, 0.25) ]);
      onNote.reset();
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 2);
      assert(onEnd.callCount === 0);
      assert.deepEqual(onNote.args[0], [ createNoteEvent(1.500, 0, 76, 0.50) ]);
      assert.deepEqual(onNote.args[1], [ createNoteEvent(1.500, 1, 69, 0.25) ]);
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
      assert.deepEqual(onNote.args[0], [ createNoteEvent(2.000, 0, 79, 0.50) ]);
      assert.deepEqual(onNote.args[1], [ createNoteEvent(2.000, 1, 67, 0.25) ]);
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
      assert.deepEqual(onEnd.args[0], [ { type: "end", playbackTime: 2.5 } ]);
      onEnd.reset();

      tickable.tick(250);
      assert(onNote.callCount === 0);
      assert(onEnd.callCount === 0);
    });
  });
});