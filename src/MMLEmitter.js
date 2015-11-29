import { EventEmitter } from "events";
import IteratorSequencer from "iterator-sequencer";
import MMLIterator from "mml-iterator";
import stripComments from "strip-comments";
import WebAudioScheduler from "web-audio-scheduler";

export default class MMLEmitter extends EventEmitter {
  constructor(source, config = {}) {
    super();

    let scheduler = config.scheduler || new WebAudioScheduler(config);
    let trackSources = stripComments(source).split(";").filter(source => !!source.trim());

    this._scheduler = scheduler;
    this._startTime = 0;
    this._sequencers = trackSources.map((source) => {
      let iter = new MMLIterator(source);
      let sequencer = new IteratorSequencer(iter, this._scheduler.interval);

      sequencer.done = false;

      return sequencer;
    });
    this._done = false;
  }

  start() {
    this._startTime = this._scheduler.currentTime;
    this._scheduler.start(({ playbackTime }) => {
      this._progress(playbackTime);
    });

    return this;
  }

  stop() {
    this._scheduler.stop(true);

    return this;
  }

  _progress(playbackTime) {
    if (this._done) {
      return;
    }

    this._sequencers.forEach((sequencer, trackNumber) => {
      if (sequencer.done) {
        return;
      }

      let items = sequencer.next();

      this._emitNoteEvent(items.value, trackNumber);

      if (items.done) {
        sequencer.done = true;
      }
    });

    this._done = this._sequencers.every(sequencer => sequencer.done);

    if (this._done) {
      this.emit("end", { type: "end", playbackTime });
    }

    let nextPlaybackTime = playbackTime + this._scheduler.interval;

    this._scheduler.insert(nextPlaybackTime, ({ playbackTime }) => {
      this._progress(playbackTime);
    });
  }

  _emitNoteEvent(noteEvents, trackNumber) {
    noteEvents.forEach((noteEvent) => {
      let playbackTime = this._startTime + noteEvent.time;
      let duration = noteEvent.duration;
      let velocity = noteEvent.velocity;
      let quantize = noteEvent.quantize;

      noteEvent.noteNumbers.forEach((noteNumber) => {
        this.emit("note", {
          type: "note",
          playbackTime,
          trackNumber,
          noteNumber,
          duration,
          velocity,
          quantize
        });
      });
    });
  }
}
