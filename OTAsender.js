var bonjour = require('bonjour')();
var process = require('process');
var http = require('http');
var fs = require('fs');

console.log('Searching....');
bonjour.find({
    type: 'http'
}, function (service) {
    if (service.name === 'OTAUpdater' && service.txt.sys === 'H2Pcs::OTA') {
        console.log("Found receiver at: ", service.addresses[0])
        var data = Buffer.from(fs.readFileSync(process.cwd() + '/.pioenvs/uno/firmware.hex')).toString('base64');
        http.get(`http://${service.addresses[0]}:${service.port}/flash/${data}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                console.log(data);
                process.exit()
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
})