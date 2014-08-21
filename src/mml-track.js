"use strict";

var WHEN = 0;
var FUNC = 1;

var extend  = require("./extend");
var Emitter = require("./emitter");
var MMLCompiler = require("./mml-compiler");

function schedSorter(a, b) {
  return a[WHEN] - b[WHEN];
}

function MMLTrack(parent, nodes, config) {
  Emitter.call(this);

  this._pos = 0;
  this._parent = parent;
  this._shared = parent;
  this._config = config;
  this._nodes = MMLCompiler.compile(this, nodes);
  this._sched = [];
  this._currentTimeIncr = 0;
}
extend(MMLTrack, Emitter);

MMLTrack.prototype._init = function(currentTime, currentTimeIncr) {
  this._currentTimeIncr = currentTimeIncr;

  var next = function(currentTime) {
    var nextCurrentTime = currentTime + this._currentTimeIncr + 0.015;
    var nodes = this._nodes;

    while (this._pos < nodes.length && currentTime < nextCurrentTime) {
      currentTime = nodes[this._pos](this, currentTime);
      this._pos += 1;
    }

    if (this._pos < nodes.length) {
      this.sched(currentTime, next);
    }

  }.bind(this);

  next(currentTime);
};

MMLTrack.prototype._process = function(currentTime) {
  var nextCurrentTime = currentTime + this._currentTimeIncr + 0.015;

  var sched = this._sched;

  while (sched.length && sched[0][WHEN] < nextCurrentTime) {
    var elem = sched.shift();

    elem[FUNC](elem[WHEN]);
  }
};

MMLTrack.prototype._recv = function(message, opts) {
  opts = opts || {};

  if (message.type === "sched") {
    this.sched(message.when, message.callback);
  }
  if (!opts.private) {
    this.emit(message.type, message);
  }
  if (opts.bubble && this._parent) {
    this._parent._recv(message);
  }
};

MMLTrack.prototype.sched = function(when, fn) {
  this._sched.push([ when, fn ]);
  this._sched.sort(schedSorter);

  return this;
};

module.exports = MMLTrack;
