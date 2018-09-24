var schedule = require('node-schedule')

var fix = e => {
    return e.length == 2 ? e : "0" + e
}

module.exports.normTime = text => {
    var hour = text.match(/\d+\sчас\D*/gi)
    hour = hour ? hour[0].match(/\d+/gi)[0] : 0
    var min = text.match(/\d+\sминут\D*/gi)
    min = min ? min[0].match(/\d+/gi)[0] : 0
    var sec = text.match(/\d+\sсекунд\D*/gi)
    sec = sec ? sec[0].match(/\d+/gi)[0] : 0
    var bighour = text.match(/\d+:\d+/gi)
    hour = bighour ? bighour[0].match(/\d+:/gi)[0].slice(0, -1) : hour
    var _min = bighour ? bighour[0].match(/:\d+/gi)[0].slice(1) : min
    var f = !text.match(/\s\d+\sсекунд\D*/gi) && text.match(/секунд\D*/gi)
    sec = f ? _min : sec
    min = f ? min : _min
    text = text.replace(/\d+\sчас\D*/gi, "")
    text = text.replace(/\d+\sминут\D*/gi, "")
    text = text.replace(/\d+\sсекунд\D*/gi, "")
    text = text.replace(/\d+:\d+/gi, "")
    text = text.replace(/\d+\:/gi, "")
    text = text.replace(/:\d+/gi, "")
    var time = [hour, min, sec].map(e => parseInt(e))
    text = (hour != 0 || min != 0 || sec != 0) ? text.concat(" " + time.map(e => fix(e.toString())).join(":")) : text
    text = text.replace(/\s+/gi, " ")
    return [text, time]
}

module.exports.chedAt = (h, m, s, f) => {
    var j = schedule.scheduleJob({
        hour: h,
        minute: m,
        second: s
    }, function () {
        j.cancel()
        f()
    })
}

module.exports.chedAfter = (h, m, s, f) => {
    let startTime = new Date(Date.now() + s * 1000 + m * 60 * 1000 + h * 60 * 60 * 1000)
    let endTime = new Date(startTime.getTime() + 1000)
    var j = schedule.scheduleJob({
        start: startTime,
        end: endTime,
        rule: '*/1 * * * * *'
    }, function () {
        j.cancel()
        f()
    })
}

module.exports.chedIter = (h, m, s, f) => {
    setInterval(f, s * 1000 + m * 60 * 1000 + h * 60 * 60 * 1000)
}

var getnoun = (number, one, two, five) => {
    number = Math.abs(number)
    number %= 100
    if (number >= 5 && number <= 20) {
        return five
    }
    number %= 10
    if (number == 1) {
        return one
    }
    if (number >= 2 && number <= 4) {
        return two
    }
    return five
}
module.exports.getnoun = getnoun

module.exports.getsensorname = (id, num) => {
    return id == 0 || id == 2 ? getnoun(num, "процент", "процента", "процентов") :
        (id == 1 ? getnoun(num, "градус", "градуса", "градусов") :
            (id == 3 ? getnoun(num, "люкс", "люкса", "люкс") :
                getnoun(num, "миллиметр", "миллиметра", "миллиметр") + " ртутного столба"))
}

module.exports.parseInt = (e) => {
    return parseInt(e[0] == '0' ? e.slice(1) : e)
}

module.exports.rc = arr => {
    return arr[Math.floor(Math.random() * arr.length)]
}