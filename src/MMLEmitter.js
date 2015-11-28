import { EventEmitter } from "events";
import MMLIterator from "mml-iterator";
import WebAudioScheduler from "web-audio-scheduler";
import DefaultConfig from "./DefaultConfig";
import MMLSequencer from "./MMLSequencer";
import stripComments from "strip-comments";
import xtend from "./utils/xtend";
import toFrequency from "./utils/toFrequency";

export default class MMLEmitter extends EventEmitter {
  constructor(source, config = {}) {
    super();

    let scheduler = config.scheduler || new WebAudioScheduler(config);
    let trackSources = stripComments(source).split(";").filter(source => !!source.trim());

    this.config = xtend(DefaultConfig, config);
    this.tracks = trackSources.map(() => new EventEmitter());
    this.scheduler = scheduler;

    this._startTime = 0;
    this._sequencers = trackSources.map((source) => {
      let iter = new MMLIterator(source, this.config);
      let sequencer = new MMLSequencer(iter, this.config.interval);

      sequencer.done = false;

      return sequencer;
    });
    this._done = false;
  }

  start() {
    this._startTime = this.scheduler.currentTime;
    this.scheduler.start(({ playbackTime }) => {
      this._progress(playbackTime);
    });

    return this;
  }

  stop() {
    this.scheduler.stop(true);

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
        this.tracks[trackNumber].emit("end", { type: "end", playbackTime });
        sequencer.done = true;
      }
    });

    this._done = this._sequencers.every(sequencer => sequencer.done);

    if (this._done) {
      this.emit("end", { type: "end", playbackTime });
    }

    let nextPlaybackTime = playbackTime + this.config.interval;

    this.scheduler.insert(nextPlaybackTime, ({ playbackTime }) => {
      this._progress(playbackTime);
    });
  }

  _emitNoteEvent(noteEvents, trackNumber) {
    noteEvents.forEach((noteEvent) => {
      let playbackTime = this._startTime + noteEvent.time;
      let duration = noteEvent.duration;
      let gateTime = noteEvent.gateTime;
      let volume = noteEvent.volume;

      noteEvent.noteNumbers.forEach((noteNumber) => {
        let frequency = toFrequency(noteNumber, this.config.A4Index, this.config.A4Frequency);
        let event = { type: "note", playbackTime, trackNumber, noteNumber, frequency, duration, gateTime, volume };

        this.emit("note", event);
        this.tracks[trackNumber].emit("note", event);
      });
    });
  }
}
