var tweet_picture = require("./twitter.js").tweet,
    Serial = require("./serial.js").Serial,
    enums = require("./serial.js").enums,
    pro = require("./protocol.js"),
    MQTT = require("./mqtt.js"),
    cfg = require("./config.js"),
    l = require("./logger.js"),
    https = require('https'),
    fs = require("fs"),
    Speech = require('./speech.js')


var DEBUG = !cfg.get("release")
var speech, mqtt;

const initialize = (guid) => {
    var serial = new Serial(() => {
        serial.guid = d

        l.info("SERIAL", "CONNECTED!")

        speech = new Speech(serial, id => {
            if (id == 0) tweet_picture()
        })
        speech.setsghdata([1, 2, 3, 4, 5, 6])
        if (!DEBUG) setInterval(tweet_picture, 10 * 60 * 1000)

        l.info("SERIAL", "SGH STARTED")

        var update_hours = serial.settime(new Date().getHours())
        setInterval(update_hours, 10 * 60 * 1000)
        update_hours();

        mqtt = new MQTT(guid, (topic, msg, p) => {
            if (msg[0] == 'QQQ') {
                return;
            } else {
                serial.sendraw(p);
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
        } else {
            l.log("SERIAL", cmd)
            l.log("SERIAL", data)
        }
    }, cfg.get((DEBUG ? "dport" : "rport")))
};

if (cfg.get("uid") == -1) {
    https.get('http://localhost:3971/create_guid', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            var d = JSON.parse(data)
            if (resp.statusCode == 200) {
                cfg.set("uid", d)
                l.ok("NGREENUID", d)
                initialize(d)
            }
        });
    })
} else {
    l.ok("GREENUID", cfg.set("uid", d))
    initialize(cfg.set("uid", d))
}