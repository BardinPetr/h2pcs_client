'use strict';
const Audio = require('audio'),
    play = require('./speak').playfile,
    fs = require('fs');

function choice(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

module.exports.play = (d, cb) => {
    var a_ok = fs.readdirSync('./songs');
    var a_err = fs.readdirSync('./songs1');
    var song = null;
    if (d[0] > 60 && 20 <= d[1] <= 25 && 50 <= d[2] <= 95 && d[3] > 2000) {
        song = "./songs/" + choice(a_ok);
    } else {
        song = "./songs1/" + choice(a_err);
    }
    play(song, cb)
}

/*
const testFolder = './songs';
const fs = require('fs');
const {
    spawn
} = require('child_process');

fs.readdir(testFolder, (err, files) => {
    var id = 0;
    files.forEach(file => {
        if (!file.startsWith('s_')) {
            console.log(`running ${file}`)
            for (var j = 0; j < 5; j++) {
                for (var i = 0; i < 41; i += 20) {
                    console.log(`trimming ${file} at ${i}`)
                    var ls = spawn('trimp3', [`./songs/${file}`, `s_${id++}.mp3`, `0${j}:${i < 10 ? '0'+i : i}`, `0${j}:${i+20}`]);
                    ls.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                    });
                }
            }
        }
    });
})
*/