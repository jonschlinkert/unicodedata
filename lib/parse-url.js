const cheerio = require('cheerio');


module.exports = function(re, config, str) {
  if (typeof config === 'string') {
    str = config;
    config = null;
  }

  var $ = cheerio.load(str, {normalizeWhitespace: true});
  var url = [];

  $('[href]').each(function (i, ele) {
    if (re.test($(this).text())) {
      url = url.concat($(this).last().attr('href').match(re).input);
    }
  });

  if (config) {
    config.url = config.url + url[url.length -1];
    return config;
  }
  return url;
};