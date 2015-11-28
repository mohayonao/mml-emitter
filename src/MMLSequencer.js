export default class MMLSequencer {
  constructor(iter, interval) {
    this.iter = iter;
    this.interval = interval;
    this._playbackTime = 0;
    this._noteEvent = null;
    this._doneTime = 0;
    this._done = false;
  }

  next() {
    let t0 = this._playbackTime + this.interval;

    if (this._done && this._doneTime < t0) {
      return { done: true, value: [] };
    }

    let result = [];
    let noteEvent;

    while ((noteEvent = this._next(t0)) !== null) {
      result.push(noteEvent);
    }

    this._playbackTime = t0;

    return { done: false, value: result };
  }

  _next(t0) {
    if (this._noteEvent) {
      return this._nextNoteEvent(t0);
    }

    let items = this.iter.next();

    if (items.done) {
      this._done = true;
      return null;
    }

    this._noteEvent = items.value;
    this._doneTime = this._noteEvent.time + this._noteEvent.duration;

    return this._next(t0);
  }

  _nextNoteEvent(t0) {
    if (t0 <= this._noteEvent.time) {
      return null;
    }

    let noteEvent = this._noteEvent;

    this._noteEvent = null;

    return noteEvent;
  }
}
