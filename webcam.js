var cfg = require("./config.js"),
    l = require("./logger.js"),
    fs = require("fs"),
    NodeWebcam = require("node-webcam");

var DEBUG = !cfg.get("release")

module.exports.Webcam = class {
    constructor(cb, cb2) {
        this.cb = cb;
        this.cb2 = cb2;
    }

    capture() {
        var Webcam,
            cb = this.cb,
            cb2 = this.cb2;
        try {
            Webcam = NodeWebcam.create({})
        } catch (e) {
            l.err("WEBCAM", e)
            return;
        }
        Webcam.capture("cam.png", {
            callbackReturn: "base64"
        }, function (err, data) {
            if (err) {
                l.err("WEBCAM", err)
                return;
            }
            l.ok("WEBCAM", "CAPTURED")
            cb()
            setTimeout(cb2, 300)
        })
    }
}