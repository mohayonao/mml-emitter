"use strict";

function config(obj) {
  obj = Object.create(obj || {});

  var defaults = {
    defaultTempo: 120,
    minTempo: 30,
    maxTempo: 240,
    defaultOctave: 5,
    minOctave: 0,
    maxOctave: 9,
    defaultLength: 4,
    minLength: 1,
    maxLength: 64,
    defaultQuantize: 6,
    minQuantize: 0,
    maxQuantize: 8,
    defaultVolume: 12,
    minVolume: 0,
    maxVolume: 16,
    octaveShiftDirection: 1,
    A4Frequency: 440.0,
    A4Index: 69,
  };

  Object.keys(defaults).forEach(function(key) {
    if (typeof obj[key] !== "number") {
      obj[key] = defaults[key];
    }
  });

  return obj;
}

module.exports.build = config;
