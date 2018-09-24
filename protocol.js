module.exports.parse = function (data) {
    if (data.indexOf("<") == 0 && data.indexOf(">") == data.length - 1 && data.length > 2) {
        data = data.slice(1, -1);
        if (data.indexOf(":") > -1) {
            data = data.split(":")
            data[1] = data[1].split(";").map(e => {
                return module.exports.norm(e)
            }).slice(0, -1)
            return data
        } else {
            return [data, []]
        }
    }
    return NaN
}

module.exports.create = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var res = "<" + args[0] + (args.length == 1 ? "" : ":")
    for (var i = 1; i < args.length; i++) {
        var e = args[i]
        res += (typeof (e) == "object" ? e.join(";") : e) + ";"
    }
    return res + ">"
}

module.exports.norm = (e) => {
    return (e.match(/[a-zA-Z]/gi) && e.match(/[a-zA-Z]/gi).length != 0) ? e : (e.indexOf(".") > 0 ? parseFloat(e) : parseInt(e))
}

module.exports.randint = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}