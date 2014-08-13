"use strict";

var SYNTAX_MML = 0;
var SYNTAX_NOTE = 1;
var SYNTAX_REST = 2;
var SYNTAX_CHORD = 3;
var SYNTAX_OCTAVE = 4;
var SYNTAX_OCTAVE_SHIFT = 5;
var SYNTAX_LENGTH = 6;
var SYNTAX_TIE = 7;
var SYNTAX_QUANTIZE = 8;
var SYNTAX_TEMPO = 9;
var SYNTAX_INF_LOOP = 10;
var SYNTAX_LOOP = 11;
var SYNTAX_METHOD_CALL = 12;
var SYNTAX_NUMBER = 13;

function Scanner(str) {
  this.str = String(str);
  this.len = this.str.length;
  this.index = 0;
  this.lineNumber = this.len ? 1 : 0;
  this.lineStart  = 0;
}

Scanner.prototype.eos = function() {
  return this.len <= this.index;
};

Scanner.prototype.peek = function() {
  return this.str.charAt(this.index);
};

Scanner.prototype.next = function() {
  return this.str.charAt(this.index++);
};

Scanner.prototype.match = function(matcher) {
  return matcher.test ?
    matcher.test(this.str.charAt(this.index)) :
    this.str.charAt(this.index) === matcher;
};

Scanner.prototype.expect = function(ch) {
  if (this.peek() === ch) {
    this.index += 1;
  } else {
    this.throwError("Unexpected token: " + this.peek());
  }
};

Scanner.prototype.scan = function(matcher) {
  var matched = matcher.exec(this.str.substr(this.index));

  if (matched && matched.index === 0) {
    matched = matched[0];
    this.index += matched.length;
  } else {
    matched = null;
  }

  return matched;
};

Scanner.prototype.skipComment = function() {
  var str = this.str;
  var len = this.len;

  while (this.index < len) {
    var ch1 = str.charCodeAt(this.index);
    var ch2 = str.charCodeAt(this.index + 1);

    if (ch1 === 0x20 || ch1 === 0x09) { // <SPACE> or <TAB>
      this.index += 1;
    } else if (ch1 === 0x0a) { // <CR>
      this.index += 1;
      this.lineNumber += 1;
      this.lineStart = this.index;
    } else if (ch1 === 0x2f) { // /
      if (ch2 === 0x2f) { // /
        this.skipSingleLineComment();
      } else if (ch2 === 0x2a) { // *
        this.skipMultiLineComment();
      }
    } else {
      break;
    }
  }
};

Scanner.prototype.skipSingleLineComment = function() {
  var str = this.str;
  var len = this.len;

  this.index += 2; // skip //

  while (this.index < len) {
    if (str.charCodeAt(this.index++) === 0x0a) { // <CR>
      this.lineNumber += 1;
      this.lineStart = this.index;
      break;
    }
  }
};

Scanner.prototype.skipMultiLineComment = function() {
  var str = this.str;
  var len = this.len;
  var depth = 1;

  this.index += 2; // skip /*

  while (this.index <= len) {
    var ch1 = str.charCodeAt(this.index++);
    var ch2 = str.charCodeAt(this.index);

    if (ch1 === 0x0a) { // <CR>
      this.line += 1;
      this.lineStart = this.index;
    } else if (ch1 === 0x2f && ch2 === 0x2a) { // /*
      this.index += 1;
      ++depth;
    } else if (ch1 === 0x2a && ch2 === 0x2f) { // */
      this.index += 1;
      if (--depth === 0) {
        return;
      }
    }
  }

  this.throwError("Unexpected token ILLEGAL");
};

Scanner.prototype.throwError = function(msg) {
  var err = new SyntaxError(msg);

  err.index = this.index;
  err.lineNumber = this.lineNumber;
  err.column = this.index - this.lineStart + 1;

  console.error(err);

  throw err;
};

function MMLParser(mml) {
  this.scanner = new Scanner(mml);
}

MMLParser.prototype.advance = function() {
  this.scanner.skipComment();

  switch (this.scanner.peek()) {
  case "c": case "d": case "e": case "f": case "g": case "a": case "b":
    return this.parseNote(0, true);
  case "(":
    return this.parseChord();
  case "r":
    return this.parseRest();
  case "o":
    return this.parseOctave();
  case "<":
    return this.parseOctaveShift(+1);
  case ">":
    return this.parseOctaveShift(-1);
  case "l":
    return this.parseLength();
  case "q":
    return this.parseQuantize();
  case "t":
    return this.parseTempo();
  case "$":
    return this.parseInfiniteLoop();
  case "[":
    return this.parseLoop();
  case "@":
    return this.parseMethodCall();
  }

  this.scanner.throwError("Unexpected token: " + this.scanner.peek());
};

MMLParser.prototype.parseMML = function() {
  var list = [];

  this.scanner.skipComment();

  while (!this.scanner.eos()) {
    list.push(this.advance());
    // console.log(list[list.length - 1], ":", this.scanner.peek());
    this.scanner.skipComment();
  }

  return {
    type: SYNTAX_MML,
    list: list
  };
};

MMLParser.prototype.parseArgument = function(matcher) {
  this.scanner.skipComment();

  if (this.scanner.match("{")) {
    return this.scanDirective();
  }

  var matched = this.scanner.scan(matcher);

  if (matched) {
    return {
      type: SYNTAX_NUMBER,
      value: +matched
    };
  }

  return null;
};

MMLParser.prototype.parseNoteNumber = function(offset) {
  return {
    c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11
  }[this.scanner.next()] + this.parseAccidental() + offset;
};

MMLParser.prototype.parseAccidental = function() {
  if (this.scanner.match("-")) {
    this.scanner.next();
    return -1;
  }

  if (this.scanner.match("+")) {
    this.scanner.next();
    return +1;
  }

  return 0;
};

MMLParser.prototype.parseDot = function() {
  return (this.scanner.scan(/\.+/) || "").length;
};

MMLParser.prototype.parseNote = function(offset, withDuration) {
  var node = {
    type: SYNTAX_NOTE,
    number: this.parseNoteNumber(offset)
  };

  if (withDuration) {
    node.length = this.parseArgument(/\d+/);
    node.dot = this.parseDot();
    node.tie = this.parseTie();
  }

  return node;
};

MMLParser.prototype.parseChord = function() {
  this.scanner.next();

  var list = [];
  var offset = 0;
  var ch;

  while (!this.scanner.eos() && (ch = this.scanner.peek()) !== ")") {
    switch (ch) {
    case "c": case "d": case "e": case "f": case "g": case "a": case "b":
      list.push(this.parseNote(offset, false));
      break;
    case "<":
      this.scanner.next();
      offset += 12;
      break;
    case ">":
      this.scanner.next();
      offset -= 12;
      break;
    default:
      this.scanner.throwError("Unexpected token: " + ch);
    }
    this.scanner.skipComment();
  }

  this.scanner.expect(")");

  return {
    type: SYNTAX_CHORD,
    list: list,
    length: this.parseArgument(/\d+/),
    dot: this.parseDot(),
    tie: this.parseTie()
  };
};

MMLParser.prototype.parseRest = function() {
  this.scanner.next();

  return {
    type: SYNTAX_REST,
    length: this.parseArgument(/\d+/),
    dot: this.parseDot(),
    tie: this.parseTie()
  };
};

MMLParser.prototype.parseOctave = function() {
  this.scanner.next();

  return {
    type: SYNTAX_OCTAVE,
    value: this.parseArgument(/\d+/)
  };
};

MMLParser.prototype.parseOctaveShift = function(direction) {
  this.scanner.next();

  return {
    type: SYNTAX_OCTAVE_SHIFT,
    direction: direction,
    value: this.parseArgument(/\d+/)
  };
};

MMLParser.prototype.parseLength = function() {
  this.scanner.next();

  return {
    type: SYNTAX_LENGTH,
    value: this.parseArgument(/\d+/),
    dot: this.parseDot(),
    tie: this.parseTie()
  };
};

MMLParser.prototype.parseTie = function() {
  this.scanner.skipComment();

  if (this.scanner.match("^")) {
    this.scanner.next();

    return {
      type: SYNTAX_TIE,
      value: this.parseArgument(/\d+/),
      dot: this.parseDot(),
      tie: this.parseTie()
    };
  }

  return null;
};

MMLParser.prototype.parseQuantize = function() {
  this.scanner.next();

  return {
    type: SYNTAX_QUANTIZE,
    value: this.parseArgument(/\d+/)
  };
};

MMLParser.prototype.parseTempo = function() {
  this.scanner.next();

  return {
    type: SYNTAX_TEMPO,
    value: this.parseArgument(/\d+(\.\d+)?/)
  };
};

MMLParser.prototype.parseInfiniteLoop = function() {
  this.scanner.next();

  var list = [];

  while (!this.scanner.eos()) {
    list.push(this.advance());
  }

  return {
    type: SYNTAX_INF_LOOP,
    list: list
  };
};

MMLParser.prototype.parseLoop = function() {
  this.scanner.next();

  return {
    type: SYNTAX_LOOP,
  };
};

MMLParser.prototype.parseMethodCall = function() {
  this.scanner.next();

var methodName = this.scanner.scan(/\$?[a-z][a-zA-Z0-9]*/);

  this.scanner.skipComment();

  var args = null;

  if (this.scanner.match("(")) {
    args = this.parseMethodArgument();
  } else {
    args = [];
  }

  return {
    type: SYNTAX_METHOD_CALL,
    name: methodName,
    args: args
  };
};

module.exports = {
  Syntax: {
    MML: SYNTAX_MML,
    Note: SYNTAX_NOTE,
    Rest: SYNTAX_REST,
    Chord: SYNTAX_CHORD,
    Octave: SYNTAX_OCTAVE ,
    OctaveShift: SYNTAX_OCTAVE_SHIFT,
    Length: SYNTAX_LENGTH,
    Tie: SYNTAX_TIE,
    Quantize: SYNTAX_QUANTIZE,
    Tempo: SYNTAX_TEMPO,
    InfLoop: SYNTAX_INF_LOOP ,
    Loop: SYNTAX_LOOP,
    MethodCall: SYNTAX_METHOD_CALL,
    Number: SYNTAX_NUMBER,
  },
  parse: function(mml) {
    return new MMLParser(mml).parseMML();
  }
};
