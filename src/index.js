"use strict";

var MMLEmitter = require("./mml-emitter");

MMLEmitter.version = "0.2.6";

/* istanbul ignore next */
if (typeof global.window !== "undefined") {
  global.window.MMLEmitter = MMLEmitter;
}

module.exports = MMLEmitter;
