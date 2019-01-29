'use strict'

const ROOT_DIR = __dirname + '/'
const language = "ru-RU"

let speak = require("./speak.js"),
    tools = require('./tools.js'),
    cfg = require('./config.js'),
    l = require('./logger.js'),
    Sonus = require('sonus'),
    apiai = require('apiai'),
    se = require('./serial.js').enums,
    fs = require('fs'),
    plants = require("./plants.js")
// chat = new(require("./chat.js"));


const normTime = tools.normTime
const speech = require('@google-cloud/speech')({
    projectId: cfg.get("google").pid,
    keyFilename: ROOT_DIR + 'assets/keys/keyfile.json'
})

const hotwords = cfg.get("snowboy.hotwords").map((e) => {
    e.file = ROOT_DIR + "/assets/hotwords/" + e.file
    return e
})

const sonus = Sonus.init({
    hotwords,
    language,
    recordProgram: "rec",
    device: 'hw:2,0'
}, speech)

var app = apiai(cfg.get("apiai_key"))

var processingerror = id => {
    var sp = "Не совсем понимаю, о чём ты."
    if (id == 1) sp = "Я не знаю такого растения"
    if (id == 2) sp = "Таймер сработал"
    speak.say(sp)
    module.exports.busy = false
}

var setbusy = (e) => {
    l.warn("BUSY", "Set to " + e)
    module.exports.busy = e
    module.exports.pbusy = e ? module.exports.pbusy : false
}

var sens = []
module.exports.busy = false
module.exports.pbusy = false
module.exports = class {
    constructor(serial, cb) {
        this.sens = undefined
        this.last_chat = "";
        setbusy(false)

        l.log("SPEECH", "INIT STARTED")
        Sonus.start(sonus)

        sonus.on('hotword', (index, keyword) => {
            if (!module.exports.busy) {
                setbusy(true)
                // setTimeout(() => {
                //     if (!module.exports.pbusy)
                //         setbusy(false)
                // }, 5000)
                speak.playfile(ROOT_DIR + "assets/audio/start.mp3")
                l.ok("SPEECH", "!" + keyword)
            }
        })
        sonus.on('error', error => {
            l.err("SPEECH", error)
            console.log(error)
            setbusy(false)
        })

        sonus.on('final-result', res => {
            if (module.exports.pbusy) return
            module.exports.pbusy = true
            setbusy(true)
            res = normTime(res)
            l.log("SPEECH FINAL", res[0])
            if (res[0].trim() == "") {
                processingerror();
            }
            // chat.send(res[0]).then(res => {
            //     module.exports.last_chat = res;
            // }).catch(err => l.err('SPEECH', err))
            var request = app.textRequest(res[0], {
                sessionId: 'srh53q3442'
            })
            request.on('response', function (response) {
                setbusy(true)
                var action = response.result.action
                var params = response.result.parameters
                var fspeech = response.result.fulfillment.speech
                l.ok("SPEECH.APIAI.RES.ACT", action)

                if (action == 'fit-flower.age') {
                    if (!params['fit-flower-age']) return processingerror()
                    serial.SETLID(se.ages[params['fit-flower-age']])
                } else if (action == 'fit-flower.name') {
                    if (!params['name']) return processingerror()
                    var xx = plants.get(params['name'])
                    if (!xx) return processingerror(1)
                    serial.SETTARGT(xx)
                } else if (action == 'main.bind') {
                    var qs = new speak.QSpeaker()
                    qs.add("Теплица готова к подключению к системе. Ваш код авторизации")
                    qs.add(serial.guid)
                    qs.start(() => {
                        setbusy(false)
                    })
                    return
                } else if (action == 'main.hello') {
                    l.ok("HELLO", "")
                } else if (action == 'main.status') {
                    if (!params['sensors']) return processingerror()
                    var sensid = se.sensors[params['sensors']]
                    var val = module.exports.sens[sensid]
                    var name = tools.getsensorname(sensid, val)
                    if ((!sensid && sensid != 0) || !val || !name) return processingerror()
                    var qs = new speak.QSpeaker()
                    qs.add(fspeech)
                    qs.add(val)
                    qs.add(name)
                    qs.start(() => {
                        setbusy(false)
                    })
                    return
                } else if (action == 'main.status-all') {
                    var qs = new speak.QSpeaker()
                    var x = fspeech.split('!').slice(0, -1)
                    for (var i = 0; i < x.length; i++) {
                        var e = x[i]
                        if (e.length == 1) {
                            e = parseInt(e)
                            var val = module.exports.sens[e]
                            var name = tools.getsensorname(e, val)
                            qs.add(val)
                            qs.add(name)
                        } else {
                            qs.add(e)
                        }
                    }
                    var additional_text = response.result.fulfillment.messages[1].payload.addtext
                    var c = module.exports.sens[0] < 50
                    qs.add(tools.rc(additional_text[c ? 1 : 0]))
                    qs.start(() => {
                        setbusy(false)
                    })
                    return
                } else if (action == 'turn-off') {
                    if (!params['actuator-type']) return processingerror()
                    if (params['time'] && params['time-type']) {
                        if (params['time-type'] == 'at') {
                            tools.chedAt(...(res[1]), () => {
                                processingerror(2)
                                serial.SETSTATE(se.ctrl[params['actuator-type']], 0)
                            })
                        } else {
                            tools.chedAfter(...(res[1]), () => {
                                processingerror(2)
                                serial.SETSTATE(se.ctrl[params['actuator-type']], 0)
                            })
                        }
                    } else {
                        serial.SETSTATE(se.ctrl[params['actuator-type']], 0)
                    }
                } else if (action == 'turn-on') {
                    if (!params['actuator-type']) return processingerror()
                    if (params['time'] && params['time-type']) {
                        if (params['time-type'] == 'at') {
                            tools.chedAt(...(res[1]), () => {
                                processingerror(2)
                                serial.SETSTATE(se.ctrl[params['actuator-type']], 1)
                            })
                        } else {
                            tools.chedAfter(...(res[1]), () => {
                                processingerror(2)
                                serial.SETSTATE(se.ctrl[params['actuator-type']], 1)
                            })
                        }
                    } else {
                        l.err(1, 1)
                        serial.SETSTATE(se.ctrl[params['actuator-type']], 1)
                    }
                } else if (action == 'mode.auto') {
                    serial.SETCTRL(0)
                } else if (action == 'mode.manual') {
                    serial.SETCTRL(1)
                } else if (action == 'social.take-photo') {
                    cb(0)
                } else if (action == 'input.unknown') {
                    // speak.say(module.exports.last_chat);
                    // setbusy(false)
                    // return;
                }
                speak.say(fspeech)
                setbusy(false)
            })
            request.on('error', function (error) {
                l.err("SPEECH", error)
                console.log(error)
                setbusy(false)
            })
            request.end()

            if (res.includes("stop")) {
                Sonus.stop()
            }
        })

        l.log("SPEECH", 'Say "' + hotwords[0].hotword + '"...')
    }

    setsghdata(a) {
        this.sens = a ? a : this.sens
        module.exports.sens = this.sens
    }
}

module.exports.sens = [1, 2, 3, 4, 5, 6]