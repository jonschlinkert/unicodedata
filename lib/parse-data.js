const file = require('fs-utils');
const _ = require('lodash');

// http://www.ksu.ru/eng/departments/ktk/test/perl/lib/unicode/UCDFF301.html
// keys are based on https://github.com/dodo/node-unicodetable
var keys = [
  'value',
  'name',
  'category',
  'class',
  'bidirectional_category',
  'mapping',
  'decimal_digit_value',
  'digit_value',
  'numeric_value',
  'mirrored',
  'unicode_name',
  'comment',
  'uppercase_mapping',
  'lowercase_mapping',
  'titlecase_mapping',
  'symbol'
];

// based on https://github.com/mathiasbynens/jsesc
function escapeChar(charValue) {
  var hex = charValue.replace(/^0*/, '');
  var len = hex.length > 2;
  return '\\' + (len ? 'u' : 'x') + ('0000' + hex).slice(len ? -4 : -2);
}

/**
 * Parse unicode data into an array of objects.
 *
 * @param   {String}  str  The UnicodeData string to parse.
 * @return  {Array}
 */

module.exports = function(str) {
  var lines = str.split('\n');

  var data = [];
  lines.map(function(line) {
    var parsed = line.split(/;/);
    parsed[15] = escapeChar(parsed[0]);
    data.push(_.zipObject(keys, parsed));
  });
  return data;
};