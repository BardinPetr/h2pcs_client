const Configstore = require('configstore')
const pkg = require('./package.json')
const conf = new Configstore(pkg.name)

if (!conf.has("uid")) {
    conf.all = {
        release: false,
        uid: -1,
        dport: "/dev/ttyACM1",
        rport: "/dev/serial0",
        twitter: {
            consumer_key: "8c993DxqKSXn117p9OcpzyBhB",
            consumer_secret: "eiHk3rGQLr0AEyznwVmGxTp8J1imA4ocNkg73tSkdKtmN5JoHb",
            access_token_key: "3449820616-1AkXtLqdliIioCxKzhJNyh4kuPMN9ZIT4pUYRt9",
            access_token_secret: "0uLX1CKYbEEVqp957WWje9zCPS9GYZLzVGJ2RwWjfLH97"
        },
        polly: {
            accessKeyId: "AKIAJEUIZ5A2Y2M5HGWA",
            secretAccessKey: "oIrmwYeOJkh8ktZHMenf1eDUVdfqwMakBmcvjaBA",
            textType: "text",
            region: "eu-west-2",
            voiceId: "Tatyana",
            sampleRate: 22050,
            outputFormat: "mp3"
        },
        apiai_key: "e3b2105e04aa4d1d887dd9888a02824a",
        google: {
            pid: 'smartgreenhouse-194905'
        },
        snowboy: {
            hotwords: [{
                file: 'GH.pmdl',
                hotword: 'GreenHouse'
            }]
        }
    }
}
conf.set('release', !require('fs').existsSync(__dirname + "/.debug"))

module.exports = conf