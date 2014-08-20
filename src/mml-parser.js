"use strict";

var Scanner = require("./scanner");
var ExprParser = require("./expr-parser");
var Syntax = require("./syntax");

function append(list, elem) {

  if (Array.isArray(elem)) {
    Array.prototype.push.apply(list, elem);
  } else if (elem) {
    list.push(elem);
  }

  return list;
}

function parse(scanner) {

  function until(matcher, fn) {
    while (true) {
      scanner.forward();
      if (!scanner.hasNext() || scanner.match(matcher)) {
        break;
      }
      fn();
    }
  }

  function noteNum(offset) {
    return {
      c:0, d:2, e:4, f:5, g:7, a:9, b:11
    }[scanner.next()] + acci() + offset;
  }

  function dot() {
    var len = (scanner.scan(/\.+/) || "").length;
    var result = new Array(len);

    for (var i = 0; i < len; i++) {
      result[i] = 0;
    }

    return result;
  }

  function acci() {
    if (scanner.match("+")) {
      scanner.next();
      return +1;
    }

    if (scanner.match("-")) {
      scanner.next();
      return -1;
    }

    return 0;
  }

  function length() {
    return append([ arg(/\d+/) ].concat(dot()), tie());
  }

  function arg(matcher) {
    if (scanner.match("(")) {
      return expr();
    }

    var num = scanner.scan(matcher);

    return num !== null ? +num : null;
  }

  function tie() {
    scanner.forward();

    if (scanner.match("^")) {
      scanner.next();
      return length(null);
    }

    return null;
  }

  function note() {
    return { type: Syntax.Note, number: [ noteNum(0) ], length: length() };
  }

  function chord() {
    scanner.expect("[");

    var number = [];
    var offset = 0;

    until("]", function() {
      switch (scanner.peek()) {
      case "c": case "d": case "e": case "f": case "g": case "a": case "b":
        number.push(noteNum(offset));
        break;
      case "<":
        scanner.next();
        offset += 12;
        break;
      case ">":
        scanner.next();
        offset -= 12;
        break;
      default:
        scanner.throwUnexpectedToken();
      }
    });

    scanner.expect("]");

    return { type: Syntax.Note, number: number, length: length() };
  }

  function r() {
    scanner.expect("r");

    return { type: Syntax.Note, number: [], length: length() };
  }

  function o() {
    scanner.expect("o");

    return { type: Syntax.Octave, value: arg(/\d+/) };
  }

  function oShift(direction) {
    scanner.expect(/<|>/);

    return { type: Syntax.OctaveShift, direction: direction|0, value: arg(/\d+/) };
  }

  function l() {
    scanner.expect("l");

    return { type: Syntax.Length, length: length() };
  }

  function q() {
    scanner.expect("q");

    return { type: Syntax.Quantize, value: arg(/\d+/) };
  }

  function t() {
    scanner.expect("t");

    return { type: Syntax.Tempo, value: arg(/\d+(\.\d+)?/) };
  }

  function v() {
    scanner.expect("v");

    return { type: Syntax.Velocity, value: arg(/\d+/) };
  }

  function infLoop() {
    scanner.expect("$");

    return { type: Syntax.InfLoop };
  }

  function loop() {
    scanner.expect("/");
    scanner.expect(":");

    var seq = [ { type: Syntax.LoopBegin } ];

    until(/[|:]/, function() {
      append(seq, advance());
    });
    append(seq, loopExit());

    scanner.expect(":");
    scanner.expect("/");

    seq.push({ type: Syntax.LoopEnd });

    seq[0].value = arg(/\d+/) || 2;

    return seq;
  }

  function loopExit() {
    var seq = [];

    if (scanner.match("|")) {
      scanner.next();

      seq.push({ type: Syntax.LoopExit });

      until(":", function() {
        append(seq, advance());
      });
    }

    return seq;
  }

  function command() {
    scanner.expect("@");

    return { type: Syntax.Command, value: arg(/\d+/) };
  }

  function expr() {
    var node;

    scanner.expect("(");

    node = ExprParser.parse(scanner);

    scanner.expect(")");

    node.variables.forEach(function(id) {
      if (id.charAt(0) === "_") {
        throw new SyntaxError(
          "A variable in directives should not be started with '_': " + id
        );
      }
    });

    return { type: Syntax.Expression, expr: node.expr, variables: node.variables };
  }

  function advance() {
    switch (scanner.peek()) {
    case "c": case "d": case "e": case "f": case "g": case "a": case "b":
      return note();
    case "[":
      return chord();
    case "r":
      return r();
    case "o":
      return o();
    case "<":
      return oShift(+1);
    case ">":
      return oShift(-1);
    case "l":
      return l();
    case "q":
      return q();
    case "t":
      return t();
    case "v":
      return v();
    case "$":
      return infLoop();
    case "/":
      return loop();
    case "@":
      return command();
    }
    scanner.throwUnexpectedToken();
  }

  function mml() {
    var seq = [];

    until("", function() {
      var track = [];

      until(";", function() {
        append(track, advance());
      });

      seq.push(track);

      if (scanner.match(";")) {
        scanner.next();
      }
    });

    return seq;
  }

  return mml();
}

module.exports.parse = function(mml) {
  return parse(new Scanner(mml));
};
