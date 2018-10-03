var tweet_picture = require("./twitter.js").tweet,
    Serial = require("./serial.js").Serial,
    enums = require("./serial.js").enums,
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

        speech = new Speech(serial, id => {
            if (id == 0) tweet_picture()
        })
        speech.setsghdata([1, 2, 3, 4, 5, 6])

        if (!DEBUG) setInterval(tweet_picture, 10 * 60 * 1000)

        l.info("SERIAL", "SGH STARTED")

        var update_hours = () => {
            serial.SETTIME(new Date().getHours())
        }
        setInterval(update_hours, 10 * 60 * 1000)
        update_hours();

        mqtt = new MQTT(guid, (topic, msg, p) => {
            if (msg[0] == 'QQQ') {
                return;
            } else {
                serial.sendraw(msg);
            }
        })
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