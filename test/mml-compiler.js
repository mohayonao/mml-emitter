"use strict";

var MMLCompiler = require("../src/mml-compiler");
var MMLParser = require("../src/mml-parser");
var Config = require("../src/config");
var Emitter = require("../src/emitter");

function duration(tempo, len, dot, quantize) {
  var mul = 1;

  for (var i = 1; i <= dot; ++i) {
    mul += Math.pow(0.5, i);
  }

  return (60 / tempo) * (4 / len) * mul * (quantize / 8);
}

describe("MMLCompiler", function() {
  describe(".compile(ctx, nodes)", function() {
    var testCase = {
      "ceg": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 6), 0 ],
        [ "end", 3 ],
      ],
      "ce8g.": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 8, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 4, 1, 6), 0 ],
        [ "end", 3 ],
      ],
      "c^^ e8^^ g^^": [
        [ "note", 0, 72, duration(120, 4, 0, 6) * 3, 0 ],
        [ "note", 1, 76, duration(120, 8, 0, 6) * 3, 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 6) * 3, 0 ],
        [ "end", 3 ],
      ],
      "[ ceg ]": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 0, 76, duration(120, 4, 0, 6), 1 ],
        [ "note", 0, 79, duration(120, 4, 0, 6), 2 ],
        [ "end", 3 ],
      ],
      "o4 ceg": [
        [ "note", 0, 60, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 64, duration(120, 4, 0, 6), 0 ],
        [ "note", 2, 67, duration(120, 4, 0, 6), 0 ],
        [ "end", 3 ],
      ],
      "c < e > g": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 88, duration(120, 4, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 6), 0 ],
        [ "end", 3 ],
      ],
      "l16 ceg": [
        [ "note", 0, 72, duration(120, 16, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 16, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 16, 0, 6), 0 ],
        [ "end", 3 ],
      ],
      "q2 ceg": [
        [ "note", 0, 72, duration(120, 4, 0, 2), 0 ],
        [ "note", 1, 76, duration(120, 4, 0, 2), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 2), 0 ],
        [ "end", 3 ],
      ],
      "t80 ceg": [
        [ "note", 0, 72, duration(80, 4, 0, 6), 0 ],
        [ "note", 1, 76, duration(80, 4, 0, 6), 0 ],
        [ "note", 2, 79, duration(80, 4, 0, 6), 0 ],
        [ "end", 3 ],
      ],
      "c $ eg": [
        [ "note",  0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note",  1, 76, duration(120, 4, 0, 6), 0 ],
        [ "note",  2, 79, duration(120, 4, 0, 6), 0 ],
        [ "note",  3, 76, duration(120, 4, 0, 6), 0 ],
        [ "note",  4, 79, duration(120, 4, 0, 6), 0 ],
        [ "note",  5, 76, duration(120, 4, 0, 6), 0 ],
        [ "note",  6, 79, duration(120, 4, 0, 6), 0 ],
        [ "note",  7, 76, duration(120, 4, 0, 6), 0 ],
        [ "note",  8, 79, duration(120, 4, 0, 6), 0 ],
        [ "note",  9, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 10, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 11, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 12, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 13, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 14, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 15, 76, duration(120, 4, 0, 6), 0 ],
      ],
      "v8": [
        [ "end", 0 ],
      ],
      "$": [
      ],
      "/: ceg :/": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 3, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 4, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 5, 79, duration(120, 4, 0, 6), 0 ],
        [ "end", 6 ],
      ],
      "/: ce |g :/3": [
        [ "note", 0, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 3, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 4, 76, duration(120, 4, 0, 6), 0 ],
        [ "note", 5, 79, duration(120, 4, 0, 6), 0 ],
        [ "note", 6, 72, duration(120, 4, 0, 6), 0 ],
        [ "note", 7, 76, duration(120, 4, 0, 6), 0 ],
        [ "end", 8 ],
      ],
      "@": [
        [ "end", 0 ],
      ],
      "q(8/4) ceg": [
        [ "note", 0, 72, duration(120, 4, 0, 2), 0 ],
        [ "note", 1, 76, duration(120, 4, 0, 2), 0 ],
        [ "note", 2, 79, duration(120, 4, 0, 2), 0 ],
        [ "end", 3 ],
      ],
      "l(16)^(16) ceg": [
        [ "note", 0, 72, duration(120, 8, 0, 6), 0 ],
        [ "note", 1, 76, duration(120, 8, 0, 6), 0 ],
        [ "note", 2, 79, duration(120, 8, 0, 6), 0 ],
        [ "end", 3 ],
      ]
    };

    Object.keys(testCase).forEach(function(mml) {
      it("'" + mml + "'", function() {
        var passed = [];
        var obj = new Emitter();

        obj._pos = 0;
        obj._config = Config.build();
        obj._recv = function(e) {
          obj.emit(e.type, e);
        };

        var when = 0;

        obj.on("note", function(e) {
          passed.push([ "note", e.when, e.midi, e.duration, e.chordIndex ]);
          when += 1;
        });

        obj.on("end", function(e) {
          passed.push([ "end", e.when ]);
        });

        var compiled = MMLCompiler.compile({}, MMLParser.parse(mml)[0]);

        while (obj._pos < compiled.length && when < 16) {
          compiled[obj._pos](obj, when);
          obj._pos += 1;
        }

        expect(passed).to.eql(testCase[mml]);
      });
    });
  });

});
