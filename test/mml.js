"use strict";

var MML = require("../src/mml");

describe("mml", function() {

  it("create instance", function() {
    var mml = new MML("");

    expect(mml).to.be.instanceOf(MML);

    expect(new MML(mml)).to.equal(mml);
  });

  it("timeline", function() {
    var timeline = [];

    var mml = new MML("cd l8 efg(ab)")
      .on("note", function(when, midi, duration, noteOff) {
        noteOff(function(when) {
          timeline.push([ when, "nOFF", midi ]);
        });

        timeline.push([ when, "note", midi ]);
      })
      .on("end", function(when) {
        timeline.push([ when, "end" ]);
      });

    var currentTime     = 100.0;
    var currentTimeIncr = 0.2;

    timeline.push([ currentTime, "init" ]);

    mml._init(currentTime, currentTimeIncr);
    currentTime += currentTimeIncr;

    while (currentTime <= 102.0) {
      timeline.push([ +currentTime.toFixed(6), "----" ]);

      mml._process(currentTime);

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
