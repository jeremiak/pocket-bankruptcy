var crypto = require('crypto-js');
require('dotenv').load();

var secret = process.env['POCKET_CONSUMER_KEY'];

function encrypt(string) {
  var x = crypto.AES.encrypt(string, secret);
  return x.toString();
}

function decrypt(string) {
  var x = crypto.AES.decrypt(string, secret);
  return x.toString(crypto.enc.Utf8);
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}; 
