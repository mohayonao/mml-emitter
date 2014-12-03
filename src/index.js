"use strict";

var MMLEmitter = require("./mml-emitter");

MMLEmitter.version = "0.2.8";

/* istanbul ignore next */
if (typeof global.window !== "undefined") {
  global.window.MMLEmitter = MMLEmitter;
}

module.exports = MMLEmitter;
