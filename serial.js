'use strict'
const SerialPort = require('serialport'),
    pro = require("./protocol.js"),
    l = require("./logger.js")

module.exports.Serial = class {
    constructor(cbs, scb, cb, port) {
        this.gdata = [
            [],
            []
        ]
        port = port || '/dev/tty-usbserial1'
        this.nrsp = true;
        this.parser = new SerialPort.parsers.Readline({
            delimiter: '\t'
        })
        this.port = new SerialPort(port, {
            baudRate: 9600
        })

        this.port.pipe(this.parser)
        this.port.on('open', () => {
            cbs()
        })

        this.parser.on('data', (data) => {
            data = pro.parse(data.toString())
            if (data[0]) {
                if (data[0] == "STARTED" || this.nrsp) {
                    scb();
                } else if (data[0] == "STAT") {
                    this.gdata[0] = data[1]
                    cb(data[0], data[1])
                } else if (data[0] == "SENS") {
                    this.gdata[1] = data[1]
                    cb(data[0], data[1])
                } else {
                    cb(data[0], data[1])
                }
            }
        })
    }

    send() {
        var args = Array.prototype.slice.call(arguments, 0)
        this.port.write(pro.create(args) + "\t")
        l.log("SPS", pro.create(args))
    }

    sendraw(a) {
        this.port.write(a + "\t")
        l.log("SPRS", a)
    }

    SETSTATE(id, status) {
        this.sendraw(pro.create("SETSTATE", id, status))
    }

    SETASTATE(a0, a1, a2, a3) {
        this.sendraw(pro.create("SETASTATE", a0, a1, a2, a3))
    }

    SETLCOL(a, b, c) {
        this.sendraw(pro.create("SETLCOL", a, b, c))
    }

    SETLID(a) {
        this.sendraw(pro.create("SETLID", a))
    }

    SETCTRL(a) {
        this.sendraw(pro.create("SETCTRL", a))
    }

    SETTIME(a) {
        this.sendraw(pro.create("SETTIME", a))
    }

    SETTARGT(a) {
        this.sendraw(pro.create("SETTARGT", a))
    }

    SETTARGG(a) {
        this.sendraw(pro.create("SETTARGG", a))
    }

    SETTARGL(a) {
        this.sendraw(pro.create("SETTARGL", a))
    }
}

module.exports.enums = {
    "ctrl": {
        "water": 0,
        "light": 1,
        "cold": 2,
        "heat": 3,
        "all": 10,
        "on": 1,
        "off": 0
    },
    "ages": {
        "old": 2,
        "young": 1
    },
    "sensors": {
        "влажность почвы": 0,
        "температура воздуха": 1,
        "влажность воздуха": 2,
        "освещенность": 3,
        "атмосферное давление": 4
    }
}