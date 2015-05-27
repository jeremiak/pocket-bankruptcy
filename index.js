var browserify = require('browserify-middleware');
var cookieParser = require('cookie-parser');
var express = require('express');
require('dotenv').load();

var crypto = require('./lib/crypto');
var encrypt = crypto.encrypt;
var decrypt = crypto.decrypt;

var pocket = require('./lib/pocket');

var app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'jade');

app.get('/app.js', browserify('./app.js')); 

app.get('/', function (req, res) {
  var token = req.cookies['pocket-access-token'];
  if (token) {
    var user = pocket.getUser(decrypt(token));
    user.then(function(user) {
      var count = Object.keys(user.list).length;
      res.render('index', { count: count });
    });
  }
  else {
    res.render('welcome');
  }
});

app.get('/auth', function (req, res) {
  var token = pocket.getRequestToken();
  token.then(function(code) {
    res.cookie('pocket-code', code);
    res.redirect(pocket.authUrl(code));
  })
});

app.get('/auth/callback', function (req, res) {
  var code = req.cookies['pocket-code'];
  var token = pocket.getAccessToken(code);
  token.then(function(t) {
    res.clearCookie('pocket-code');
    res.cookie('pocket-access-token', encrypt(t));
    res.redirect('/');
  })
});

app.get('/logout', function (req, res) {
  res.clearCookie('pocket-access-token');
  res.redirect('/');
});

app.get('/bankrupt', function (req, res) {
  var cookie = req.cookies['pocket-access-token'];

  if (!cookie) {
    res.sendStatus(401);  
  }
  var token = decrypt(req.cookies['pocket-access-token']);
  var user = pocket.getUser(token);
  user.then(function(user) {
    var fakeList = Object.keys(user.list).slice(0, 2);
    pocket.archiveItems(token, fakeList)
        .then(function(s) {
          console.log('response', Object.keys(s['status']));
          res.sendStatus(200);
        });
  });
  
});

var server = app.listen(3000, function () {
  var name = require('./package.json')['name'];
  var host = server.address().address;
  var port = server.address().port;
  console.log('%s listening at http://%s:%s', name, host, port);
});
