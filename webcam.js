var cfg = require("./config.js"),
    l = require("./logger.js"),
    fs = require("fs"),
    NodeWebcam = require("node-webcam");

var DEBUG = !cfg.get("release")

module.exports.Webcam = class {
    constructor(cb) {
        this.cb = cb;
    }

    capture() {
        var Webcam;
        try {
            Webcam = NodeWebcam.create({})
        } catch (e) {
            l.err("WEBCAM", e)
            return;
        }
        Webcam.capture("cam.png", {
            callbackReturn: "base64"
        }, this.cb)
    }
}