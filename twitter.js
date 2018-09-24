var cfg = require("./config.js"),
    l = require("./logger.js"),
    fs = require("fs"),
    NodeWebcam = require("node-webcam"),
    Twitter = require('twitter')


var DEBUG = !cfg.get("release")

var Webcam, twitterClient

try {
    Webcam = NodeWebcam.create({})
    twitterClient = new Twitter(cfg.get("twitter"))
} catch (e) {
    l.err("WEBCAM", e)
}


module.exports.tweet = () => {
    Webcam.capture("cam.png", function (err, data) {
        if (err) {
            l.err("WEBCAM", err)
        } else {
            l.ok("WEBCAM", "CAPTURED")
            var photo = fs.readFileSync('cam.png')
            l.ok("TWITTER_MEDIA", "UPLOAD STARTED")

            twitterClient.post('media/upload', {
                media: photo
            }, function (error, media, response) {
                if (!error) {
                    l.ok("TWITTER_MEDIA", "UPLOAD FINISHED! " + media)

                    var status = {
                        status: (DEBUG ? '!!! This post is from debug version !!!\n\n' : '') + 'See how my plants growing. (Posted by my SmartGreenHouse)',
                        media_ids: media.media_id_string
                    }

                    twitterClient.post('statuses/update', status, function (error, tweet, response) {
                        if (!error) {
                            l.ok("TWITTER", "FINISHED! " + response)
                        } else {
                            l.err("TWITTER", error)
                        }
                    })
                } else {
                    l.err("TWITTER_MEDIA", "")
                    console.error(error)
                }
            })
        }
    })
}