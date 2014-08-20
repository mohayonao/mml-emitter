"use strict";

var KEYWORDS =[
  // keywords
  "break","case","catch","continue","debugger","default","delete","do","else",
  "finally","for","function","if","in","instanceof","new","return","switch",
  "this","throw","try","typeof","var","void","while","with","undefined",
  // reserved
  "abstract","boolean","byte","char","class","const","double","enum","export",
  "extends","final","float","goto","implements","import","int","interface",
  "long","native","package","private","protected","public","short","static",
  "super","synchronized","throws","transient","volatile",
  // ECMA 5 - use strict
  "arguments","let","yield"
];

var WRAPPING_PAIRS = { "{": "}", "(": ")", "[": "]" };

function peek(list) {
  return list[list.length - 1];
}

function isKeyword(id) {
  return KEYWORDS.indexOf(id) !== -1;
}

function parse(scanner) {
  function identifier() {
  return scanner.scan(/[_$a-zA-Z][_$\w]*/);
  }

  function string() {
    return scanner.scan(/('|").*?\1/);
  }

  function number() {
    return scanner.scan(/\d+\.?\d*(e[-+]?\d+)?|0x[\da-f]+/i);
  }

  function member() {
    return scanner.next() + identifier();
  }

  function expr() {
    var variables = [];
    var stack = [];

    function variable() {
      var id = identifier();

      if (isKeyword(id)) {
        throw new SyntaxError(
          "Statements should not be used in directives: " + id
        );
      }

      if (peek(stack) === "}") {
        scanner.scan(/\s*/);
        scanner.expect(":");

        var next = expr();

        [].push.apply(variables, next.variables);

        return id + ":" + next.expr;
      }

      if (!/^([A-Z]\w*|\$|_|true|false|null)$/.test(id)) {
        variables.push(id);
        id = "this." + id;
      }

      return id;
    }

    function inExpr() {
      if (!scanner.hasNext()) {
        return false;
      }

      var ch = scanner.peek();

      switch (ch) {
      case "{": case "(": case "[":
        stack.push(WRAPPING_PAIRS[ch]);
        break;
      case "]": case ")": case "}":
        if (stack.length === 0) {
          return false;
        }
        if (stack.pop() !== ch) {
          scanner.throwUnexpectedToken();
        }
      }

      return true;
    }

    var code = "";

    while (inExpr()) {
      var ch = scanner.peek();

      if (ch === "'" || ch === "\"") {
        code += string();
      } else if ("0" <= ch && ch <= "9") {
        code += number();
      } else if (ch === ".") {
        code += member();
      } else if (/[_$a-zA-Z]/.test(ch)) {
        code += variable();
      } else {
        code += scanner.next();
      }
    }

    return { expr: code, variables: variables };
  }

  return expr();
}

module.exports.parse = parse;
