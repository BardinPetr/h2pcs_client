var STK = require('stk500');
var colors = require('colors');
var tools = require('./tools');
var Protocol = require('./protocol');
var util = require('util');
var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

gpio.setMode(gpio.MODE_BCM)

var Stk500v1 = function (options) {
  options.protocol = STK;
  Protocol.call(this, options);
};

util.inherits(Stk500v1, Protocol);

/**
 * Uploads the provided hex file to the board, via the stk500v1 protocol
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v1.prototype._upload = function (file, callback) {
  var _this = this;

  this.serialPort = this.connection.serialPort;

  // open/parse supplied hex file
  var hex = tools._parseHex(file);
  if (!Buffer.isBuffer(hex)) {
    return callback(hex);
  }

  // open connection
  _this.serialPort.open(function (error) {
    if (error) {
      return callback(error);
    }

    _this.debug('connected');

    // reset
    _this._reset(function (error) {
      if (error) {
        return callback(error);
      }

      _this.debug('flashing, please wait...');

      // flash
      _this.chip.bootload(_this.serialPort, hex, _this.board, function (error) {
        var color = (error ? colors.red : colors.green);

        _this.debug(color('flash complete.'));

        // Always close the serialport
        _this.serialPort.close();

        return callback(error);
      });
    });
  });
};

Stk500v1.prototype._reset = function (callback) {
  var _this = this;

  gpiop.setup(5, gpio.DIR_OUT)
    .then(() => {
      return gpiop.write(5, true)
    })
    .then(() => {
      setTimeout(() => {
        return gpiop.write(5, false)
      }, 200)
    })
    .then(() => {
      return callback(null)
    })
    .catch((err) => {
      console.log('Error: ', err.toString())
      return callback(err)
    });

};

module.exports = Stk500v1;