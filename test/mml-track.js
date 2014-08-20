"use strict";

var MMLParser = require("../src/mml-parser");
var MMLTrack = require("../src/mml-track");

describe("MMLTrack", function() {

  it("should work", function() {
    var timeline = [];

    var track = new MMLTrack(null, MMLParser.parse("cd l(len) efg[ab]")[0])
      .on("note", function(e) {
        var midi = e.midi;

        e.noteOff(function(when) {
          timeline.push([ when, "nOFF", midi ]);
        });

        timeline.push([ e.when, "note", e.midi ]);
      })
      .on("end", function(e) {
        timeline.push([ e.when, "end" ]);
      });
    track.len = 8;

    var currentTime     = 100.0;
    var currentTimeIncr = 0.2;

    timeline.push([ currentTime, "init" ]);

    track._init(currentTime, currentTimeIncr);
    currentTime += currentTimeIncr;

    while (currentTime <= 102.0) {
      timeline.push([ +currentTime.toFixed(6), "----" ]);

      track._process(currentTime);

      currentTime += currentTimeIncr;
    }

    expect(timeline).to.eql([
      [ 100.0000, "init",    ],
      [ 100.0000, "note", 72 ],
      [ 100.2000, "----",    ],
      [ 100.3750, "nOFF", 72 ],
      [ 100.4000, "----",    ],
      [ 100.5000, "note", 74 ],
      [ 100.6000, "----",    ],
      [ 100.8000, "----",    ],
      [ 100.8750, "nOFF", 74 ],
      [ 101.0000, "note", 76 ],
      [ 101.0000, "----",    ],
      [ 101.1875, "nOFF", 76 ],
      [ 101.2000, "----",    ],
      [ 101.2500, "note", 77 ],
      [ 101.4000, "----",    ],
      [ 101.4375, "nOFF", 77 ],
      [ 101.5000, "note", 79 ],
      [ 101.6000, "----",    ],
      [ 101.6875, "nOFF", 79 ],
      [ 101.7500, "note", 81 ],
      [ 101.7500, "note", 83 ],
      [ 101.8000, "----",    ],
      [ 101.9375, "nOFF", 81 ],
      [ 101.9375, "nOFF", 83 ],
      [ 102.0000, "end" ,    ]
    ]);
  });
});