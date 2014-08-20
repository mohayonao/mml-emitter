"use strict";

var Emitter = require("../src/emitter");

describe("Emitter", function() {
  var emitter = null;

  beforeEach(function() {
    emitter = new Emitter();
  });

  describe(".on(event, listener)", function() {
    it("should add listeners", function() {
      var passed = [];

      emitter.on("bang", function(val) {
        passed.push("!", val);
      });

      emitter.on("bang", function(val) {
        passed.push("?", val);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe(".once(event, listener)", function() {
    it("should add a single-shot listener", function() {
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([ "!", 1, "?", 1 ]);
    });
  });

  describe(".off(event, listener)", function() {
    it("should remove a listener", function() {
      var passed = [];

      function bang(val) {
        passed.push("!", val);
      }

      emitter.on("bang", bang);

      emitter.on("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([ "?", 1, "?", 3 ]);
    });

    it("should work with .once()", function() {
      var passed = [];

      function bang(val) {
        passed.push("!", val);
      }

      emitter.once("bang", bang);

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([ "?", 1 ]);
    });
  });

  describe(".off(event)", function() {
    it("should remove all listeners for an event", function(){
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang");
      emitter.off("ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([]);
    });
  });

  describe(".off()", function() {
    it("should remove all listeners", function(){
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off();

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      expect(passed).to.eql([]);
    });
  });

});
