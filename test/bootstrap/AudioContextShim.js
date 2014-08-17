(function(global) {
  "use strict";

  var SAMPLERATE  = 44100;
  var BUFFER_SIZE = 512;
  var CURRENT_TIME_INCR = BUFFER_SIZE / SAMPLERATE;

  function AudioContext() {
    this.sampleRate = SAMPLERATE;
    this.currentTime = 0;
    this.destination = this;
    this.counter = 0;
    this.child = null;
  }

  AudioContext.prototype.createScriptProcessor = function() {
    return new ScriptProcessorNode();
  };

  AudioContext.prototype.process = function(duration) {
    this.counter -= duration;

    while (this.counter <= 0) {
      if (this.child) {
        this.child.process();
      }
      this.currentTime += CURRENT_TIME_INCR;
      this.counter += CURRENT_TIME_INCR;
    }
  };

  function ScriptProcessorNode() {
    this.destination = null;
    this.onaudioprocess = null;
  }

  ScriptProcessorNode.prototype.connect = function(destination) {
    this.destination = destination;
    this.destination.child = this;
  };

  ScriptProcessorNode.prototype.disconnect = function() {
    if (this.destination) {
      this.destination.child = null;
    }
  };

  ScriptProcessorNode.prototype.process = function() {
    if (this.onaudioprocess) {
      this.onaudioprocess();
    }
  };

  global.AudioContextShim = AudioContext;

})(this.self || global);
