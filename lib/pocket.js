var urlFormat = require('url').format;
var urlParse = require('url').parse;

var request = require('request-promise');
require('dotenv').load();

var config = {
  'consumer_key': process.env.POCKET_CONSUMER_KEY,
  'redirect_uri': process.env.POCKET_REDIRECT_URL
};

var baseHeaders = {
  'X-Accept': 'application/json',
  'Content-Type': 'application/json; charset=UTF8'
};

var defaults = {
  method: 'POST',
  headers: baseHeaders,
  baseUrl: 'https://getpocket.com'
};

var r = request.defaults(defaults);

function generateAuthUrl(requestToken) {
  var url = {
    host: urlParse(defaults.baseUrl)['host'],
    pathname: 'auth/authorize',
    query: {
      'request_token': requestToken,
      'redirect_uri': config.redirect_uri
    }
  }
 
  return urlFormat(url, true, true);;
} 

function getRequestToken() {
  var options = {
    uri: 'v3/oauth/request',
    body: JSON.stringify(config)
  };

  return r(options).then(parseCode).catch(handleError);

  function parseCode(response) {
    return JSON.parse(response).code;
  }

  function handleError(error) {
    console.log('err happened', i);
  }
}

function getAccessToken(requestToken) {
  var body = {
    consumer_key: config['consumer_key'],
    code: requestToken
  };
 
  var options = {
    uri: 'v3/oauth/authorize',
    body: JSON.stringify(body)
  };

  return r(options).then(parseToken).catch(handleError)

  function parseToken(response) {
    return (JSON.parse(response))['access_token']
  }

  function handleError(error) {
    console.log('access token error')
  }
}

function getUser(accessToken) {
  var body = {
    consumer_key: config['consumer_key'],
    access_token: accessToken,
    state: 'unread'
  };

  var options = {
    uri: '/v3/get',
    body: JSON.stringify(body) 
  };

  return r(options).then(parseUser).catch(handleError);

  function parseUser(user) {
    return JSON.parse(user);
  }

  function handleError(error) {
    console.log('err');
  }
} 

function archiveItems(accessToken, itemIds) {
 var body = {
    consumer_key: config['consumer_key'],
    access_token: accessToken,
    actions: itemIds.map(function(id) {
      return {
        action: 'archive',
        item_id: id
      }
    }) 
  }; 
  
  var options = {
    baseUrl: 'https://getpocket-com-gwqynjms41pa.runscope.net/',
    uri: '/v3/send',
    body: JSON.stringify(body) 
  };

  return r(options).then(parseResponse).catch(handleError);

  function parseResponse(response) {
    return JSON.parse(response);
  }

  function handleError(error) {
    console.log('err');
  }
}

module.exports = {
  authUrl: generateAuthUrl,
  getAccessToken: getAccessToken,
  getRequestToken: getRequestToken,
  getUser: getUser,
  archiveItems: archiveItems
};
