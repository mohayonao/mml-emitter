"use strict";

describe("wamml", function() {

  describe("version", function() {
    it("should equal the version specified by package.json", function() {
      var pkg = require("../../package.json");

      expect(Wamml.version).to.equal(pkg.version);
    });
  });

});
