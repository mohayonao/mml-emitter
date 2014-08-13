"use strict";

var mmlParser = require("../../src/mml-parser");

describe("mml-parser", function() {
  var testCase = {
  };

  Object.keys(testCase).forEach(function(mml) {
    it("parse('" + mml + "')", function() {
      if (testCase[mml] instanceof Error) {
        expect(function() {
          mmlParser.parse(mml);
        }).throw(testCase[mml].constructor, testCase[mml].message);
      } else {
        expect(mmlParser.parse(mml)).to.eql(testCase[mml]);
      }
    });
  });

});
