// #!/usr/bin/env node

const path = require('path');
const file = require('fs-utils');

// try this with bluebird too! See how each lib handles
// errors when they aren't defined correctly.
// const Promise = require('bluebird');
const Promise = require('promise');


const request = require('request');
const log = require('verbalize');
const _ = require('lodash');
const parseUrl = require('./lib/parse-url');
const parseData = require('./lib/parse-data');

log.runner = 'unicode-json';

var options = {
  url: 'http://www.unicode.org/Public/',
  headers: {
    'User-Agent': 'request'
  }
};

var makePromise = function(config) {
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
};

function download(config) {
  var options = _.extend({}, config);
  var promise = makePromise(config);
  var url = '';

  promise.then(function(data) {
    // Find the latest version
    return parseUrl(/^\d/, options, data);
  }).then(function(result) {
    // Go to the page for the latest version
    url += result.url + 'ucd/';
    options.url = url;
    return download(options);
  }).then(function(result) {
    // Find the UnicodeData file for the latest version
    url += parseUrl(/UnicodeData/, result);
    options.url = url;
    // Download the actual data file.
    return download(options);
  }).then(function(unicode) {
    var name = path.basename(options.url);
    // Write out the raw unicode data as a string.
    file.writeFileSync('tmp/' + name, unicode);
    // parse the string into an array of objects
    file.writeJSONSync('tmp/data.json', parseData(unicode));
    return unicode;
  });
  // .catch(function(error) {
  //   log.error(error);
  // });

  return promise;
}

/**
 * Download the latest UnicodeData file
 * and parse it into an array of objects.
 */

download(options);
