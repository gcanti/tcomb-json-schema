'use strict';

var t = require('tcomb');

function isInteger(n) {
  return typeof n === 'number' && isFinite(n) && Math.floor(n) === n;
}

var Null = t.irreducible('Null', function(x) {
  return x === null;
});
var Int = t.irreducible('Int', isInteger);

module.exports = {
  isInteger: isInteger,
  Null: Null,
  Int: Int
};
