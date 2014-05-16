#!/usr/bin/env node

const cheerio = require('cheerio');
const file = require('fs-utils');
const request = require('request');
const log = require('verbalize');
const parseData = require('./lib/parse-data');

log.runner = 'unicode-json';

var options = {
  url: 'http://www.unicode.org/Public/7.0.0/ucd/',
  headers: {
    'User-Agent': 'request'
  }
};

log.writeln();
log.inform('downloading', options.url);


/**
 * Download the unicodeData file
 */

function callback(err, response, body) {
  if (!err && response.statusCode === 200) {
    var $ = cheerio.load(body);
    var url = '';

    $("[href]").each(function (i, ele) {
      if (/UnicodeData/.test($(this).text())) {
        url = $(this).text().match(/UnicodeData.+/)[0];
        options.url = options.url + url;
      }
    });

    request(options, function(err, response, body) {
      // Write out the raw unicode data as a string.
      file.writeFileSync('tmp/' + url, body);

      // parse the string into an array of objects
      file.writeJSONSync('tmp/_data.json', parseData(body));

      // Success message.
      log.done('done');
    });

  } else {
    log.error(err);
  }
}

request(options, callback);