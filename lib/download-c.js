// #!/usr/bin/env node

const path = require('path');
const file = require('fs-utils');
const Promise = require('bluebird');
const request = require('request');
const log = require('verbalize');
const _ = require('lodash');
const parseUrl = require('./lib/parse-url');
const parseData = require('./lib/parse-data');


log.runner = 'unicode-json';

/**
 * Example alternate method of doing the same thing as index.js
 */


var options = {
  url: 'http://www.unicode.org/Public/',
  headers: {
    'User-Agent': 'request'
  }
};

function get(config) {
  return new Promise(function (resolve, reject) {
    request(config, function (err, response, body) {
      if (err) {
        return reject(err);
      } else if (response.statusCode !== 200) {
        err = new Error('Unexpected status code: ' + response.statusCode);
        return reject(err);
      }
      resolve(body);
    });
  });
}

function getVersion(opts, callback) {
  get(opts).then(function (body) {
    var version = _.last(parseUrl(/^\d/, body));
    var url = opts.url + version;

    log.inform('looking', 'most recent unicode-data version is ' + log.green(version.replace(/\/$/, '')));
    callback(url);

  }, function (err) {
    log.error('%s; %s', err, opts.url);
  });
}


function getFilename(opts, callback) {
  getVersion(opts, function(url) {
    opts.url = url + 'ucd/';
    get(opts).then(function (body) {
      var filename = parseUrl(/UnicodeData/, body);

      log.inform('looking', 'data is stored in', log.green(filename));
      callback(filename);

    }, function (err) {
      log.error(err);
    });
  });
}


function download(opts, callback) {
  getFilename(opts, function (url) {
    opts.url += url;
    log.inform('getting', opts.url);

    get(opts).then(function (body) {
      callback(body);
    }, function (err) {
      log.error(err);
    });
  });
}

download(options, function(unicodeString) {
  var name = path.basename(options.url);
  // Write out the raw unicode data as a string.
  file.writeFileSync('tmp/' + name, unicodeString);

  // parse the str into an array of objects
  file.writeJSONSync('tmp/data.json', parseData(unicodeString));
});