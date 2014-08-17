"use strict";

var BUFFER_SIZE = 512;

var extend  = require("./extend");
var Emitter = require("./emitter");
var MML     = require("./mml");

function Sequencer(audioContext) {
  Emitter.call(this);

  this.audioContext = audioContext;
  this.tracks = [].slice.call(arguments, 1).map(function(mml) {
    return new MML(mml);
  });
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

Sequencer.prototype._process = function() {
  var currentTime = this.audioContext.currentTime;

  this.tracks.forEach(function(track) {
    track._process(currentTime);
  });
};

module.exports = Sequencer;
