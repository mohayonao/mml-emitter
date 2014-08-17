"use strict";

var compile = require("../src/compile");
var parse = require("../src/parse");
var Emitter = require("../src/emitter");

function toComparable(args) {
  return [].slice.call(args).map(function(elem) {
    return typeof elem === "function" ? "<function>" : elem;
  });
}

function duration(tempo, len, dot, quantize) {
  var mul = 1;

  for (var i = 1; i <= dot; ++i) {
    mul += Math.pow(0.5, i);
  }

  return (60 / tempo) * (4 / len) * mul * (quantize / 8);
}

describe("compile", function() {
  var testCase = {
    "": [
      [ "end", 0 ],
    ],
    "ceg": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "ce8g.": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 8, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 1, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "c^^ e8^^ g^^": [
      [ "note", 0, 72, duration(120, 4, 0, 6) * 3, "<function>", 0 ],
      [ "note", 1, 76, duration(120, 8, 0, 6) * 3, "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 6) * 3, "<function>", 0 ],
      [ "end", 3 ],
    ],
    "( ceg )": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 0, 76, duration(120, 4, 0, 6), "<function>", 1 ],
      [ "note", 0, 79, duration(120, 4, 0, 6), "<function>", 2 ],
      [ "end", 3 ],
    ],
    "o4 ceg": [
      [ "note", 0, 60, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 64, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 67, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "c < e > g": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 88, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "l16 ceg": [
      [ "note", 0, 72, duration(120, 16, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 16, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 16, 0, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "q2 ceg": [
      [ "note", 0, 72, duration(120, 4, 0, 2), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 4, 0, 2), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 2), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "t80 ceg": [
      [ "note", 0, 72, duration(80, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(80, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(80, 4, 0, 6), "<function>", 0 ],
      [ "end", 3 ],
    ],
    "c $ eg": [
      [ "note",  0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  1, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  2, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  3, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  4, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  5, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  6, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  7, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  8, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note",  9, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 10, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 11, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 12, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 13, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 14, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 15, 76, duration(120, 4, 0, 6), "<function>", 0 ],
    ],
    "$": [
    ],
    "[ ceg ]": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 3, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 4, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 5, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "end", 6 ],
    ],
    "[ ce|g ]3": [
      [ "note", 0, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 1, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 2, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 3, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 4, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 5, 79, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 6, 72, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "note", 7, 76, duration(120, 4, 0, 6), "<function>", 0 ],
      [ "end", 8 ],
    ],
  };

  Object.keys(testCase).forEach(function(mml) {
    it("'" + mml + "'", function() {
      var passed = [];
      var obj = new Emitter();
      var state = {
        index: 0,
        emit : obj.emit.bind(obj),
        sched: function() {}
      };
      var when = 0;

      obj.on("note", function() {
        passed.push([ "note" ].concat(toComparable(arguments)));
        when += 1;
      });

      obj.on("end", function() {
        passed.push([ "end" ].concat(toComparable(arguments)));
      });

      var compiled = compile(parse(mml));

      while (state.index < compiled.length && when < 16) {
        compiled[state.index](when, state);
        state.index += 1;
      }

      expect(passed).to.eql(testCase[mml]);
    });
  });

});
