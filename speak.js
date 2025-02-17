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
const Lame = require("node-lame").Lame;
var encoder;

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
    var tmpf = ROOT_DIR + "tmp.mp3";
    encoder = new Lame({
      output: tmpf,
      scale: 10,
      "vbr-quality": 0,
      bitrate: 192
    }).setFile(file);
    encoder
      .encode()
      .then(() => {
        execSync("mpg123 " + tmpf, [], {
          stdio: "ignore"
        });
        if (cb) cb();
      })
      .catch(error => {
        if (cb) cb();
      });
  }
};
var ding = () => playfile(ROOT_DIR + "assets/audio/ding.mp3");

module.exports.playfile = playfile;
module.exports.ding = ding;
module.exports.say = (text, cb) => {
  if (!text) return;
  let filePath = module.exports.xhash(text);
  if (!fs.existsSync(filePath)) {
    let fileStream = fs.createWriteStream(filePath);
    options.text = text;
    console.log(options);
    polly.textToSpeech(options, (err, audioStream) => {
      if (err) {
        module.exports.say("Есть проблемы с синтезом речи", () => {});
      }
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
      if (err) {
        module.exports.say(
          " ^u ^a ^b ^l    ^`           ^k  ^a  ^a     ^b          ^`   ^g  ",
          () => {}
        );
      }
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
    if (conf.has("greed")) {
      for (var e = 0; e < length; e++) {
        var i = this.xq[e];
        this.fetch(i);
      }
    } else {
      this.tcnt = 1;
      this.xq = [this.xq.join(" ")];
      l.ok("NOGREED", this.xq[0]);
      this.fetch(this.xq[0]);
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
        if (err) {
          module.exports.say(
            " ^u ^a ^b ^l    ^`           ^k  ^a  ^a     ^b          ^`   ^g  ",
            () => {}
          );
        }
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