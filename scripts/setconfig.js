const commandLineArgs = require('command-line-args')
const options = commandLineArgs([
    {
        name: 'f',
        type: String,
        multiple: true,
        defaultOption: true
    }
])
require('./../config.js').set(options.f[0], options.f[1])

console.log(require('./../config.js').all)