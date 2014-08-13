"use strict";

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

Scanner.prototype.expect = function(matcher) {
  if (this.match(matcher)) {
    this.index += 1;
  } else {
    this.throwUnexpectedToken();
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
    } else if (ch1 === 0x2f && ch2 === 0x2f) {
      this.skipSingleLineComment();
    } else if (ch1 === 0x2f && ch2 === 0x2a) {
      this.skipMultiLineComment();
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

  while (this.index < len) {
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
        this.index += 1;
        return;
      }
    }
  }

  this.throwUnexpectedToken();
};

Scanner.prototype.throwUnexpectedToken = function() {
  var ch = this.peek();
  var msg = "Unexpected token" + (ch ? (": " + ch) : " ILLEGAL");
  var err = new SyntaxError(msg);

  err.index = this.index;
  err.lineNumber = this.lineNumber;
  err.column = this.index - this.lineStart + (ch ? 1 : 0);

  console.error(err);

  throw err;
};

function MMLParser(mml) {
  this.scanner = new Scanner(mml);
}

MMLParser.prototype.advance = function() {
};

MMLParser.prototype.parseMML = function() {
};

module.exports = {
  parse: function(mml) {
    return new MMLParser(mml).parseMML();
  }
};
