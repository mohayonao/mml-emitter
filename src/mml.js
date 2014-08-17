"use strict";

var WHEN = 0;
var FUNC = 1;

var compile = require("./compile");
var parse   = require("./parse");
var extend  = require("./extend");
var Emitter = require("./emitter");

function schedSorter(a, b) {
  return a[WHEN] - b[WHEN];
}

function MML(mml) {
  if (mml instanceof MML) {
    return mml;
  }

  Emitter.call(this);

  this._nodes = compile(parse(mml));
  this._state = {
    index: 0,
    emit : this.emit.bind(this),
    sched: this.sched.bind(this)
  };
  this._sched = [];
  this._currentTimeIncr = 0;
}
extend(MML, Emitter);

MML.prototype._init = function(currentTime, currentTimeIncr) {
  this._currentTimeIncr = currentTimeIncr;

  var next = function(currentTime, state) {
    var nextCurrentTime = currentTime + this._currentTimeIncr;
    var nodes = this._nodes;

    while (state.index < nodes.length && currentTime < nextCurrentTime) {
      var when = nodes[state.index](currentTime, state);

      state.index += 1;

      if (when) {
        currentTime = when;
      }
    }

    if (state.index < nodes.length) {
      state.sched(currentTime, next);
    }

  }.bind(this);

  next(currentTime, this._state);
};

MML.prototype._process = function(currentTime) {
  var nextCurrentTime = currentTime + this._currentTimeIncr;

  var sched = this._sched;
  var state = this._state;

  while (sched.length && sched[0][WHEN] < nextCurrentTime) {
    var elem = sched.shift();

    elem[FUNC](elem[WHEN], state);
  }
};

MML.prototype.sched = function(when, fn) {
  this._sched.push([ when, fn ]);
  this._sched.sort(schedSorter);

  return this;
};

module.exports = MML;
