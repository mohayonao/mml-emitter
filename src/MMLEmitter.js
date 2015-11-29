import { EventEmitter } from "events";
import IntervalIterator from "interval-iterator";
import MMLIterator from "mml-iterator";
import assign from "object-assign";
import stripComments from "strip-comments";
import WebAudioScheduler from "web-audio-scheduler";

export default class MMLEmitter extends EventEmitter {
  constructor(source, config = {}) {
    super();

    let scheduler = config.scheduler || new WebAudioScheduler(config);
    let trackSources = stripComments(source).split(";").filter(source => !!source.trim());
    let MMLIteratorClass = config.MMLIterator || MMLIterator;

    this._scheduler = scheduler;
    this._startTime = 0;
    this._iters = trackSources.map((source) => {
      let baseIter = new MMLIteratorClass(source, config);
      let iter = new IntervalIterator(baseIter, this._scheduler.interval);

      iter.done = false;

      return iter;
    });
    this._done = false;
  }

  start() {
    this._startTime = this._scheduler.currentTime;
    this._scheduler.start(({ playbackTime }) => {
      this._progress(playbackTime);
    });
  }

  stop() {
    this._scheduler.stop(true);
  }

  _progress(playbackTime) {
    if (this._done) {
      return;
    }

    this._iters.forEach((iter, trackNumber) => {
      if (iter.done) {
        return;
      }

      let iterItem = iter.next();

      this._emitNoteEvent(iterItem.value, trackNumber);

      if (iterItem.done) {
        iter.done = true;
      }
    });

    this._done = this._iters.every(iter => iter.done);

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
      let type = "note";
      let playbackTime = this._startTime + noteEvent.time;

      this.emit("note", assign({ type, playbackTime, trackNumber }, noteEvent));
    });
  }
}
