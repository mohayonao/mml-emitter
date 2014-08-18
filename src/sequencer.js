"use strict";

var BUFFER_SIZE = 512;

var extend  = require("./extend");
var parse   = require("./parse");
var compile = require("./compile");
var Emitter = require("./emitter");
var Track   = require("./track");

function Sequencer(audioContext, mml) {
  Emitter.call(this);

  this.audioContext = audioContext;
  this.tracks = parse(mml).map(compile).map(function(nodes) {
    return new Track(this, nodes);
  }, this);
  this._ended = 0;
  this._node = null;
  this._currentTime = 0;
  this._currentTimeIncr = 0;
}
extend(Sequencer, Emitter);

Sequencer.prototype.start = function() {
  this.stop();

  var currentTime = this.audioContext.currentTime;
  var currentTimeIncr = BUFFER_SIZE / this.audioContext.sampleRate;

  this.tracks.forEach(function(track) {
    track._init(currentTime, currentTimeIncr);
  }, this);

  this._node = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

  this._node.onaudioprocess = this._process.bind(this);

  this._node.connect(this.audioContext.destination);

  return this;
};

Sequencer.prototype.stop = function() {
  if (this._node) {
    this._node.disconnect();
  }
  this._node = null;

  return this;
};

Sequencer.prototype.onmessage = function(message) {
  /* istanbul ignore else */
  if (message && message.type === "end") {
    this._ended += 1;
    if (this.tracks.length <= this._ended) {
      this.emit("end", message);
    }
  }
};

Sequencer.prototype._process = function() {
  var currentTime = this.audioContext.currentTime;

  this.tracks.forEach(function(track) {
    track._process(currentTime);
  });
};

module.exports = Sequencer;
