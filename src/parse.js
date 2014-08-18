"use strict";

var Syntax = require("./syntax");

function append(list, elem) {

  if (Array.isArray(elem)) {
    Array.prototype.push.apply(list, elem);
  } else if (elem) {
    list.push(elem);
  }

  return list;
}

function defaults(val, defaultValue) {
  return val === null ? defaultValue : val;
}

function scanner(str) {
  str = String(str);

  var len = str.length;
  var pos = 0;
  var lineNumber = len ? 1 : 0;
  var lineStart  = 0;

  function hasNext() {
    return pos < len;
  }

  function peek() {
    return str.charAt(pos);
  }

  function next() {
    return str.charAt(pos++);
  }

  function match(matcher) {
    return matcher.test ?
      matcher.test(str.charAt(pos)) :
      str.charAt(pos) === matcher;
  }

  function expect(matcher) {
    if (!match(matcher)) {
      throwUnexpectedToken();
    }
    pos += 1;
  }

  function scan(matcher) {
    var matched = matcher.exec(str.substr(pos));

    if (matched && matched.index === 0) {
      matched = matched[0];
      pos += matched.length;
    } else {
      matched = null;
    }

    return matched;
  }

  function skipComment() {
    while (hasNext()) {
      var ch1 = str.charCodeAt(pos);
      var ch2 = str.charCodeAt(pos + 1);

      if (ch1 === 0x20 || ch1 === 0x09) { // <SPACE> or <TAB>
        pos += 1;
      } else if (ch1 === 0x0a) { // <CR>
        pos += 1;
        lineNumber += 1;
        lineStart = pos;
      } else if (ch1 === 0x2f && ch2 === 0x2f) {
        skipSingleLineComment();
      } else if (ch1 === 0x2f && ch2 === 0x2a) {
        skipMultiLineComment();
      } else {
        break;
      }
    }
  }

  function skipSingleLineComment() {
    pos += 2; // skip //

    while (hasNext()) {
      if (str.charCodeAt(pos++) === 0x0a) { // <CR>
        lineNumber += 1;
        lineStart = pos;
        break;
      }
    }
  }

  function skipMultiLineComment() {
    var depth = 1;

    pos += 2; // skip /*

    while (hasNext()) {
      var ch1 = str.charCodeAt(pos++);
      var ch2 = str.charCodeAt(pos);

      if (ch1 === 0x0a) { // <CR>
        lineNumber += 1;
        lineStart = pos;
      } else if (ch1 === 0x2f && ch2 === 0x2a) { // /*
        pos += 1;
        ++depth;
      } else if (ch1 === 0x2a && ch2 === 0x2f) { // */
        pos += 1;
        if (--depth === 0) {
          pos += 1;
          return;
        }
      }
    }

    throwUnexpectedToken();
  }

  function throwUnexpectedToken() {
    var ch = peek();
    var msg = "Unexpected token" + (ch ? (": '" + ch + "'") : " ILLEGAL");
    var err = new SyntaxError(msg);

    err.index = pos;
    err.lineNumber = lineNumber;
    err.column = pos - lineStart + (ch ? 1 : 0);

    throw err;
  }

  return {
    hasNext: hasNext,
    peek: peek,
    next: next,
    match: match,
    expect: expect,
    scan: scan,
    forward: skipComment,
    throwUnexpectedToken: throwUnexpectedToken
  };
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

  function length(defaultVal) {
    return append([ defaults(arg(/\d+/), defaultVal) ].concat(dot()), tie());
  }

  function arg(matcher) {
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
    return { type: Syntax.Note, number: [ noteNum(0) ], length: length(null) };
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

    return { type: Syntax.Note, number: number, length: length(null) };
  }

  function r() {
    scanner.expect("r");

    return { type: Syntax.Note, number: [], length: length(null) };
  }

  function o() {
    scanner.expect("o");

    return { type: Syntax.Octave, value: defaults(arg(/\d+/), 5) };
  }

  function oShift(direction) {
    scanner.expect(/<|>/);

    return { type: Syntax.OctaveShift, direction: direction|0, value: defaults(arg(/\d+/), 1) };
  }

  function l() {
    scanner.expect("l");

    return { type: Syntax.Length, length: length(4) };
  }

  function q() {
    scanner.expect("q");

    return { type: Syntax.Quantize, value: defaults(arg(/\d+/), 6) };
  }

  function t() {
    scanner.expect("t");

    return { type: Syntax.Tempo, value: defaults(arg(/\d+(\.\d+)?/), 120) };
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
    case "$":
      return infLoop();
    case "/":
      return loop();
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

module.exports = function(mml) {
  return parse(scanner(mml));
};
