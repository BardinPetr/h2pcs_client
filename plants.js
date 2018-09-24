var plants = require(__dirname + "/assets/data/plants.json")

module.exports.get = key => {
    try {
        var e = plants.filter(e => {
            return e.name == key
        })
        return e[0] ? e[0].temp : undefined
    } catch (e) {
        console.error(e)
        return undefined
    }
}