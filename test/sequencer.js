"use strict";

var Sequencer = require("../src/sequencer");

describe("sequencer", function() {
  it("should work", function() {
    var audioContext = new AudioContextShim();
    var sequencer = new Sequencer(audioContext, "ceg");

    expect(sequencer.start()).to.equal(sequencer);
    expect(sequencer.stop()).to.equal(sequencer);
  });

  it("timeline", function() {
    var audioContext = new AudioContextShim();
    var sequencer = new Sequencer(audioContext, "cege; l8>ccccdddd");

    var timeline = [];

    sequencer.tracks[0].on("note", function(e) {
      timeline.push([ e.when, "note(0)", e.midi ]);
    }).on("end", function(e) {
      timeline.push([ e.when, "end(0)" ]);
    });

    sequencer.tracks[1].on("note", function(e) {
      timeline.push([ e.when, "note(1)", e.midi ]);
    }).on("end", function(e) {
      timeline.push([ e.when, "end(1)" ]);
    });

    sequencer.on("end", function(e) {
      timeline.push([ e.when, "end(*)" ]);
    });

    sequencer.start();

    audioContext.process(2.5);

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
      [ 1.75, 'note(1)', 62 ],
      [ 2.00, 'end(0)' ,    ],
      [ 2.00, 'end(1)' ,    ],
      [ 2.00, 'end(*)' ,    ],
    ]);
  });
});
