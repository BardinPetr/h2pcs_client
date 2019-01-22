'use strict'

const mqtt = require('mqtt'),
    pro = require("./protocol.js"),
    cfg = require("./config.js"),
    l = require("./logger.js");

module.exports = class {
    constructor(guid, onrec) {
        this.guid = guid
        var client = mqtt.connect(`mqtt://${cfg.get('srv')[cfg.get('release') ? 'release' : 'debug']}:1883`)
        client.on('connect', function () {
            client.subscribe(`/sgh/${guid}/ctrl`)
            l.info("MQTT", "CONNECTED!")
        })

        client.on('message', function (topic, message) {
            l.warn("MQTT MSG", message)
            onrec(topic, message, pro.parse(message.toString()))
        })
        this.client = client;
    }

    send() {
        var args = Array.prototype.slice.call(arguments, 0);
        this.client.publish(`/sgh/${this.guid}/${args[0]}`, pro.create(...(args.slice(1))))
    }
}