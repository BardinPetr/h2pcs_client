const yandex_speech = require('yandex-speech'),
    speak = require("./speak.js");

const millis = () => new Date().getTime();

var s = millis();
yandex_speech.TTS({
    developer_key: 'c7d74b1f-8929-4bc7-807d-9c37d38e6e1b', //069b6659-984b-4c5f-880e-aaedcfd84102
    speaker: 'oksana',
    text: 'Привет, мир!',
    file: 'hello.mp3'
}, () => {
    console.log(millis() - s);
    s = millis();
    speak.say("Привет, мир!", () => {
        console.log(millis() - s);
    });
});