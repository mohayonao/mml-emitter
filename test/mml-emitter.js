"use strict";

var MMLEmitter = require("../src/mml-emitter");

describe("MMLEmitter", function() {

  describe(".version", function() {
    it("should equal the version specified by package.json", function() {
      var pkg = require("../package.json");

      expect(MMLEmitter.version).to.equal(pkg.version);
    });
  });

  it("should work", function() {
    var audioContext = new AudioContextShim();
    var mmlEmitter = new MMLEmitter(audioContext, "cege; @($len) l8>ccccdddd");

    mmlEmitter.len = 8;

    var timeline = [];

    mmlEmitter.tracks[0].on("note", function(e) {
      timeline.push([ e.when, "note(0)", e.midi ]);
    }).on("end", function(e) {
      timeline.push([ e.when, "end(0)" ]);
    });

    mmlEmitter.tracks[1].on("note", function(e) {
      timeline.push([ e.when, "note(1)", e.midi ]);
    }).on("end", function(e) {
      timeline.push([ e.when, "end(1)" ]);
    });

    mmlEmitter.on("end", function(e) {
      timeline.push([ e.when, "end(*)" ]);
    });

    mmlEmitter.start();

    audioContext.process(2.5);

    mmlEmitter.stop();

    expect(timeline).to.eql([
      [ 0.00, 'note(0)', 72 ],
      [ 0.00, 'note(1)', 60 ],
      [ 0.25, 'note(1)', 60 ],
      [ 0.50, 'note(0)', 76 ],
      [ 0.50, 'note(1)', 60 ],
      [ 0.75, 'note(1)', 60 ],
      [ 1.00, 'note(0)', 79 ],
      [ 1.00, 'note(1)', 62 ],
      [ 1.25, 'note(1)', 62 ],
      [ 1.50, 'note(0)', 76 ],
      [ 1.50, 'note(1)', 62 ],
      [ 1.75, 'note(1)', 62 ],
      [ 2.00, 'end(0)' ,    ],
      [ 2.00, 'end(1)' ,    ],
      [ 2.00, 'end(*)' ,    ],
    ]);
  });
});
