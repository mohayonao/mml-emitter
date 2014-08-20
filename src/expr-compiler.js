"use strict";

function startsWithDollar(id) {
  return id.charAt(0) === "$";
}

function notHasOwnProperty(id) {
  return !this.hasOwnProperty(id);
}

function defineSharedVariable(id) {
  var name = id.substr(1);

  Object.defineProperty(this, id, {
    get: function() {
      return (this._shared && this._shared[name]) || null;
    },
    set: function(value) {
      if (this._shared) {
        this._shared[name] = value;
      }
    }
  });
}

function compile(ctx, expr) {
  var fn;

  try {
    fn = new Function("return " + expr.expr + ";"); // jshint ignore: line
  } catch (e) {
    throw new Error("Error parsing expression: " + expr.expr);
  }

  expr.variables
    .filter(startsWithDollar)
    .filter(notHasOwnProperty, ctx)
    .forEach(defineSharedVariable, ctx);

  return {
    valueOf: function(ctx) {
      var num = fn.call(ctx);

      return typeof num === "number" ? num : null;
    }
  };
}

module.exports.compile = compile;
