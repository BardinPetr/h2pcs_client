'use strict';
const parseString = require('xml2js').parseString,
    translate = require('translate'),
    http = require('http');

translate.engine = 'yandex';
translate.key = 'trnsl.1.1.20180307T143339Z.4661a63b058f62d7.dd0ffc8ecfca85e4edafa40e51620885e61c05a4';

module.exports = class {
    constructor() {
        this.cuid = null;
    }

    detect(x) {
        return x.match(/^[^A-z]+$/g) === null ? false : true;
    }

    trans(x) {
        return new Promise((resolve, reject) => {
            let lang = this.detect(x);
            if (!lang) {
                return translate(x, 'ru').then(text => {
                    resolve(text);
                }).catch(err => reject(err));
            }
            resolve(x);
        })
    }

    send(txt) {
        var _this = this;
        return new Promise((resolve, reject) => {
            http.get(`http://www.botlibre.com/rest/api/form-chat?instance=667676&message=${encodeURIComponent(txt)}&application=9189442570793821298` + (this.cuid ? `&conversation=${this.cuid}` : ``), resp => {
                let data = "";
                resp.on("data", chunk => {
                    data += chunk;
                });
                resp.on("end", () => {
                    try {
                        parseString(data, function (err, result) {
                            _this.trans(result.response.message[0]).then((res) => {
                                resolve(res);
                            }, (err) => {
                                reject(err)
                            });
                        });
                    } catch (ex) {
                        reject(ex)
                    }
                });
            });
        });
    }
};