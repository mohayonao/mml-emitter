"use strict";

var ExprCompiler = require("../src/expr-compiler");

describe("ExprCompiler", function() {
  describe("compile", function() {

    it("should return an object that is executable with .valueOf()", function() {
      var expr = ExprCompiler.compile({}, {
        expr: "2 * 3", variables: []
      });

      expect(expr.valueOf()).to.equal(6);
    });

    it("should return a number anytime when .valueOf()", function() {
      var expr = ExprCompiler.compile({}, {
        expr: "{ a: 2, b: 3 }", variables: []
      });

      expect(expr.valueOf()).is.null;
    });

    it("should use specified context when .valueOf(context)", function() {
      var obj = {
        a: 2, b: 3
      };

      var expr = ExprCompiler.compile(obj, {
        expr: "this.a * this.b", variables: [ "a", "b" ]
      });

      expect(expr.valueOf(obj)).to.equal(6);
    });

    it("should throw error when failed parsing expression", function() {
      expect(function() {
        ExprCompiler.compile({}, {
          expr: "(* 2 3)", variables: []
        });
      }).throw(Error, "Error parsing expression");
    });

    describe("shared variables", function() {
      it("getter via a shared object", function() {
        var obj = {
          _shared: { a: 2, b : 3 }
        };
        var expr = ExprCompiler.compile(obj, {
          expr: "this.$a * this.$b", variables: [ "$a", "$b" ]
        });

        expect(expr.valueOf(obj)).to.equal(6);
      });

      it("setter via a shared object", function() {
        var obj = {
          _shared: { a: 2, b : 3 }
        };
        var expr = ExprCompiler.compile(obj, {
          expr: "this.$a = 6", variables: [ "$a", "$b" ]
        });

        expect(expr.valueOf(obj)).to.equal(6);
        expect(obj._shared.a).to.equal(6);
      });

      it("when not have a shared object", function() {
        var obj = {};

        var expr = ExprCompiler.compile(obj, {
          expr: "this.$a = this.$b", variables: [ "$a", "$b" ]
        });

        expect(expr.valueOf(obj)).is.null;
      });
    });

  });
});
