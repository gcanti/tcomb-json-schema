var t = require('tcomb');
var fcomb = require('fcomb');

var assert = t.assert;
var Str = t.Str;
var Num = t.Num;
var Bool = t.Bool;
var Obj = t.Obj;
var Arr = t.Arr;
var Any = t.Any;
var subtype = t.subtype;
var enums = t.enums;
var union = t.union;

var sType = enums.of('string number boolean object array', 'sType');

function and(f, g) {
  return f ? fcomb.and(f, g) : g;
}

var types = {
  string: function (s) {
    var predicate;
    if (s.hasOwnProperty('minLength')) {
      predicate = and(predicate, fcomb.minLength(s.minLength));
    }
    if (s.hasOwnProperty('maxLength')) {
      predicate = and(predicate, fcomb.maxLength(s.maxLength));
    }
    return predicate ? subtype(Str, predicate) : Str;
  },
  number: function (s) {
    var predicate;
    if (s.hasOwnProperty('minimum')) {
      predicate = s.exclusiveMinimum ?
        and(predicate, fcomb.gt(s.minimum)) :
        and(predicate, fcomb.gte(s.minimum));
    }
    if (s.hasOwnProperty('maximum')) {
      predicate = s.exclusiveMaximum ?
        and(predicate, fcomb.lt(s.maximum)) :
        and(predicate, fcomb.lte(s.maximum));
    }
    return predicate ? subtype(Num, predicate) : Num;
  },
  boolean: function (s) {
    return Bool;
  },
  object: function (s) {
    return Obj;
  },
  array: function (s) {
    return Arr;
  }
};

function toType(s) {
  assert(Obj.is(s));
  if (!s.hasOwnProperty('type')) {
    return Any;
  }
  var type = s.type;
  if (sType.is(type)) {
    return types[s.type](s);
  } else if (Arr.is(type)) {
    return union(type.map(function (type) {
      return types[type](s);
    }));
  }
  t.fail('unhandled %j', s);
}

module.exports = toType;