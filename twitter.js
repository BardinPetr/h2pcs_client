var cfg = require("./config.js"),
    l = require("./logger.js"),
    fs = require("fs"),
    Twitter = require('twitter')


var DEBUG = !cfg.get("release")

var twitterClient;

module.exports.tweet = () => {
    if (require('fs').existsSync(__dirname + "/.notweet")) return;
    try {
        twitterClient = new Twitter(cfg.get("twitter"))
    } catch (e) {
        l.err("TWITTER", e)
    }
    var photo = fs.readFileSync('cam.png')
    l.ok("TWITTER_MEDIA", "UPLOAD STARTED")

    twitterClient.post('media/upload', {
        media: photo
    }, function (error, media, response) {
        if (!error) {
            l.ok("TWITTER_MEDIA", "UPLOAD FINISHED! " + media)

            var status = {
                status: (DEBUG ? '!!! This post is from debug version !!!\n\n' : '') + 'See how my plants growing. (Posted by my H2Pcs)',
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