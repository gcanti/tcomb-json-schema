'use strict';

var t = require('tcomb');

function isInteger(n) {
  return n % 1 === 0;
}

var Null = t.irreducible('Null', function (x) { return x === null; });
var Int = t.irreducible('Int', isInteger);

module.exports = {
  isInteger: isInteger,
  Null: Null,
  Int: Int
};