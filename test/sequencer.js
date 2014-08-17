"use strict";

var Sequencer = require("../src/sequencer");
var MML = require("../src/mml");

describe("sequencer", function() {
  it("should work", function() {
    var audioContext = new AudioContextShim();
    var sequencer = new Sequencer(audioContext, "ceg");

    expect(sequencer.start()).to.equal(sequencer);
    expect(sequencer.stop()).to.equal(sequencer);
  });

  it("timeline", function() {
    var audioContext = new AudioContextShim();
    var sequencer = new Sequencer(audioContext, "cege", "l8>ccccdddd");

    var timeline = [];

    sequencer.tracks[0].on("note", function(when, midi) {
      timeline.push([ when, "note(0)", midi ]);
    });

    sequencer.tracks[1].on("note", function(when, midi) {
      timeline.push([ when, "note(1)", midi ]);
    });

    sequencer.start();

    audioContext.process(2);

    sequencer.stop();

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
      [ 1.75, 'note(1)', 62 ]
    ]);
  });
});
