"use strict";

function Scanner(str) {
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

module.exports = Scanner;
