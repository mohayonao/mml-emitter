"use strict";

var ExprParser = require("../src/expr-parser");
var Scanner = require("../src/scanner");

describe("ExprParser", function() {
  describe(".parse(scanner)", function() {
    var testCase = {
      "100.0": {
        expr: "100.0",
        variables: []
      },
      "'ab.c'": {
        expr: "'ab.c'",
        variables: []
      },
      "ab.c": {
        expr: "this.ab.c",
        variables: [ "ab" ]
      },
      "Math.atan2(a, b)": {
        expr: "Math.atan2(this.a, this.b)",
        variables: [ "a", "b" ]
      },
      "[ a, b ]": {
        expr: "[ this.a, this.b ]",
        variables: [ "a", "b" ]
      },
      "{ a: b }": {
        expr: "{ a: this.b }",
        variables: [ "b" ]
      },
      "{ a: { b: [ c, d ] } }": {
        expr: "{ a: { b: [ this.c, this.d ] } }",
        variables: [ "c", "d" ]
      },
      "$a": {
        expr: "this.$a",
        variables: [ "$a" ]
      },
      "[ $, _, null, true, false ]": {
        expr: "[ $, _, null, true, false ]",
        variables: []
      },
      "([ 1 )": new SyntaxError("Unexpected token: ')'"),
      "while (false);": new SyntaxError("Statements should not be used in directives: while")
    };

    Object.keys(testCase).forEach(function(expr) {
      if (testCase[expr] instanceof Error) {
        it("'" + expr + "' throws " + testCase[expr].message, function() {
          expect(function() {
            ExprParser.parse(Scanner(expr));
          }).throw(testCase[expr].constructor, testCase[expr].message);
        });
      } else {
        it("'" + expr + "'", function() {
          expect(ExprParser.parse(Scanner(expr))).to.eql(testCase[expr]);
        });
      }
    });
  });
});
