const chalk = require('chalk')

function f(a, b){
    return "[ " + a + " ] " + b
}

module.exports.log = function(t, m){
    console.log(f(t, m))
}

module.exports.ok = function(t, m){
    console.log(chalk.greenBright(f(t, m)))
}

module.exports.info = function(t, m){
    console.log(chalk.blue(f(t, m)))
}

module.exports.warn = function(t, m){
    console.log(chalk.yellow("WARN " + f(t, m)))
}

module.exports.err = function(t, m){
    console.log(chalk.red("ERR  " + f(t, m)))
}