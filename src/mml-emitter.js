"use strict";

var BUFFER_SIZE = 512;

var extend = require("./extend");
var MMLParser = require("./mml-parser");
var MMLTrack = require("./mml-track");
var Config = require("./config");
var Emitter = require("./emitter");

function MMLEmitter(audioContext, mml, config) {
  Emitter.call(this);

  config = Config.build(config);

  this.audioContext = audioContext;
  this.tracks = MMLParser.parse(mml).map(function(nodes) {
    return new MMLTrack(this, nodes, config);
  }, this);
  this._ended = 0;
  this._node = null;
  this._currentTime = 0;
  this._currentTimeIncr = 0;
}
extend(MMLEmitter, Emitter);

MMLEmitter.prototype.start = function() {
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

MMLEmitter.prototype.stop = function() {
  if (this._node) {
    this._node.disconnect();
  }
  this._node = null;

  return this;
};

MMLEmitter.prototype._recv = function(message) {
  /* istanbul ignore else */
  if (message && message.type === "end") {
    this._ended += 1;
    if (this.tracks.length <= this._ended) {
      this.emit("end", message);
    }
  }
};

MMLEmitter.prototype._process = function() {
  var currentTime = this.audioContext.currentTime;

  this.tracks.forEach(function(track) {
    track._process(currentTime);
  });
};

module.exports = MMLEmitter;
