'use strict'

const mqtt = require('mqtt'),
    pro = require("./protocol.js"),
    cfg = require("./config.js"),
    l = require("./logger.js");

module.exports = class {
    constructor(guid, onrec) {
        this.guid = guid
        this.client = mqtt.connect('mqtt://localhost:1889')
        this.client.on('connect', function () {
            this.client.subscribe(`/sgh/${this.guid}/ctrl`)
            l.info("MQTT", "CONNECTED!")
        })

        this.client.on('message', function (topic, message) {
            message = pro.parse(message.toString())
            l.warn("MQTT MSG", message)
            onrec(topic, message, message.toString())
        })
    }

    send() {
        var args = Array.prototype.slice.call(arguments, 0);
        this.client.publish(args[0], pro.create(...(args.slice(1))))
    }
}