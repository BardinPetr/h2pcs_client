"use strict";

const ROOT_DIR = __dirname + "/";

let fs = require("fs"),
  _hash = require("crypto-toolkit").Hash("hex"),
  Polly = require("polly-tts"),
  exec = require("exec"),
  conf = require("./config"),
  Queue = require("better-queue"),
  l = require("./logger.js"),
  spawn = require("cross-spawn"),
  chain = require("unchain"),
  execSync = require("child_process").execSync;

var options = conf.get("polly");
let polly = new Polly(options);

var playfile = (file, cb) => {
  if (!file) return;
  if (!conf.get("release")) {
    l.ok("PLAYER", "Playing using play.sh");
    //execSync(__dirname + '/scripts/play.sh', [file], {
    execSync("mpg123 -q  " + file, [], {
      stdio: "ignore"
    });
  } else {
    l.ok("PLAYER", "Playing");
    execSync("lame --scale 10 " + file + " play.mp3", [], { stdio: "ignore" });
    execSync("mpg123 play.mp3", [], {
      stdio: "ignore"
    });
  }
  if (cb) cb();
};
var ding = () => playfile(ROOT_DIR + "assets/audio/ding.mp3");
ding();

module.exports.playfile = playfile;
module.exports.ding = ding;
module.exports.say = (text, cb) => {
  if (!text) return;
  let filePath = module.exports.xhash(text);
  if (!fs.existsSync(filePath)) {
    let fileStream = fs.createWriteStream(filePath);
    options.text = text;
    polly.textToSpeech(options, (err, audioStream) => {
      audioStream.pipe(fileStream);
      audioStream.on("end", () => {
        playfile(filePath, cb);
      });
    });
  } else {
    playfile(filePath, cb);
  }
};

module.exports.fetch = (text, cb) => {
  if (!text) return;
  let filePath = module.exports.xhash(text);
  if (!fs.existsSync(filePath)) {
    let fileStream = fs.createWriteStream(filePath);
    options.text = text;
    polly.textToSpeech(options, (err, audioStream) => {
      audioStream.pipe(fileStream);
      audioStream.on("end", () => {
        if (cb) cb();
      });
    });
  } else {
    if (cb) cb();
  }
};

module.exports.xsay = (text, cb) => {
  if (!text) return;
  let filePath = module.exports.xhash(text);
  if (fs.existsSync(filePath)) {
    playfile(filePath, cb);
  } else {
    cb();
  }
};

module.exports.xhash = text => {
  return __dirname + "/temp/" + _hash.sha256(text) + ".mp3";
};

module.exports.QSpeaker = class {
  constructor() {
    this.xq = [];
    this.cnt = 0;
    this.tcnt = 0;
    this.cb = undefined;
    l.ok("QSPEAKER", "Queue created");
  }

  add(text) {
    this.xq.push(text);
    this.tcnt += 1;
    l.log("QSPEAKER", "New element");
  }

  start(cb) {
    this.cb = cb;
    l.ok("QSPEAKER", "Fetching started");
    for (var e = 0; e < this.xq.length; e++) {
      var i = this.xq[e];
      this.fetch(i);
    }
  }

  onfinish() {
    l.log("QSPEAKER", "One element fetching finished");
    this.cnt += 1;
    if (this.cnt == this.tcnt) {
      l.ok("QSPEAKER", "Fetching comleted");
      l.ok("QSPEAKER", "Queue started");
      var fchain = [];
      var exq = this.xq.reverse();
      for (var e = 0; e < this.xq.length; e++) {
        fchain.push(() => {
          module.exports.xsay(exq.pop(), () => {
            l.ok("PLAYER", "FINISHED PLAYING");
          });
        });
        fchain.push(50);
      }
      fchain.push(500);
      fchain.push(() => {
        this.cb();
      });
      chain(fchain)();
    }
  }

  fetch(text) {
    let filePath = module.exports.xhash(text);
    if (!fs.existsSync(filePath)) {
      let fileStream = fs.createWriteStream(filePath);
      options.text = text;
      polly.textToSpeech(options, (err, audioStream) => {
        audioStream.pipe(fileStream);
        audioStream.on("end", () => {
          this.onfinish();
        });
      });
    } else {
      this.onfinish();
    }
  }
};
