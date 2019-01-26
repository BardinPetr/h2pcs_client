var plants = require(__dirname + "/assets/data/plants.json")

module.exports.get = key => {
    try {
        return plants[key.toLowerCase()] ? plants[key] : undefined
    } catch (e) {
        console.error(e)
        return undefined
    }
}