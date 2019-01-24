var tweet_picture = require("./twitter.js").tweet,
    Serial = require("./serial.js").Serial,
    NodeWebcam = require("node-webcam"),
    pro = require("./protocol.js"),
    MQTT = require("./mqtt.js"),
    cfg = require("./config.js"),
    l = require("./logger.js"),
    http = require('http'),
    fs = require("fs"),
    Speech = require('./speech.js'),
    speak = require('./speak.js'),
    music = require('./music.js');


var DEBUG = !cfg.get("release")
var speech, mqtt;



const initialize = (guid) => {
    var serial = new Serial(() => {
        serial.guid = guid

        l.info("SERIAL", "CONNECTED!")

        mqtt = new MQTT(guid, (topic, msg, p) => {
            if (msg[0] == 'QQQ') {
                return;
            } else {
                serial.sendraw(msg);
            }
        })

        const capture = () => {
            try {
                var Webcam = NodeWebcam.create({})
                Webcam.capture("cam.png", {
                    callbackReturn: "base64"
                }, function (err, data) {
                    if (err) {
                        l.err("WEBCAM", err);
                        return;
                    }
                    l.ok("WEBCAM", "Sending a picture")
                    tweet_picture();
                    mqtt.send_image(data)
                })
            } catch (e) {
                l.err("WEBCAM", e)
                return;
            }
        }

        speech = new Speech(serial, id => {
            if (id == 0) capture()
        })
        speech.setsghdata([1, 2, 3, 4, 5, 6])

        if (!DEBUG) setInterval(() => {
            capture();
        }, 4000)

        l.info("SERIAL", "SGH STARTED")

        var update_hours = () => serial.SETTIME(new Date().getHours());
        setInterval(update_hours, 10 * 60 * 1000)
        update_hours();
    }, () => {}, (cmd, data) => {
        if (cmd == "STAT") {
            serial.gdata[1] = data
            mqtt.send("data", "STAT", ...data)
        } else if (cmd == "SENS") {
            serial.gdata[0] = data
            speech.setsghdata(data)
            mqtt.send("data", "SENS", ...data)
        } else if (cmd == "MOTION") {
            l.warn("MOTION!", "1")
            return;
            music.play(serial.gdata[0], () => {
                setTimeout(() => {
                    speak.say('Привет!')
                }, 1000);
            });
        } else {
            l.log("SERIAL", cmd)
            l.log("SERIAL", data)
        }
    }, cfg.get((DEBUG ? "dport" : "rport")))
};

cfg.set("uid", 111);
initialize(111)

/*
if (cfg.get("uid") == -1) {
    http.get(`http://${cfg.get('srv')[cfg.get('release') ? 'release' : 'debug']}:3971/create_guid`, resp => {
        let data = "";
        resp.on("data", chunk => {
            data += chunk;
        });
        resp.on("end", () => {
            var d = JSON.parse(data);
            if (resp.statusCode == 200) {
                cfg.set("uid", d);
                l.ok("NGREENUID", d);
                initialize(d);
            }
        });
    });
} else {
    initialize(cfg.get("uid"))
}
*/