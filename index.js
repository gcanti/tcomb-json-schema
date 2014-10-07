var t = require('tcomb');
var fcomb = require('fcomb');

var assert = t.assert;
var Str = t.Str;
var Num = t.Num;
var Obj = t.Obj;
var Arr = t.Arr;
var subtype = t.subtype;
var enums = t.enums;

var Type = enums.of('null string number boolean object array', 'Type');

function and(f, g) {
  return f ? fcomb.and(f, g) : g;
}

var isInteger = fcomb.util.addDoc(function isInteger(n) {
  return n % 1 === 0;
}, 'an integer number');

var types = {

  string: function (s) {
    if (s.hasOwnProperty('enum')) {
      return enums.of(s['enum']);
    }
    var predicate;
    if (s.hasOwnProperty('minLength')) {
      predicate = and(predicate, fcomb.minLength(s.minLength));
    }
    if (s.hasOwnProperty('maxLength')) {
      predicate = and(predicate, fcomb.maxLength(s.maxLength));
    }
    if (s.hasOwnProperty('pattern')) {
      predicate = and(predicate, fcomb.regexp(new RegExp(s.pattern)));
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
    if (s.hasOwnProperty('integer') && s.integer) {
      predicate = and(predicate, isInteger);
    }
    return predicate ? subtype(Num, predicate) : Num;
  },

  boolean: function (s) {
    return t.Bool;
  },

  object: function (s) {
    var props = {};
    var hasProperties = false;
    var required = {};
    if (s.required) {
      s.required.forEach(function (k) {
        required[k] = true;
      });
    }
    for (var k in s.properties) {
      if (s.properties.hasOwnProperty(k)) {
        hasProperties = true;
        var type = toType(s.properties[k]);
        props[k] = required[k] ? type : t.maybe(type);
      }
    }
    return hasProperties ? t.struct(props, s.description) : Obj;
  },

  array: function (s) {
    if (s.hasOwnProperty('items')) {
      var items = s.items;
      if (Obj.is(items)) {
        return t.list(toType(s.items));
      }
      return t.tuple(items.map(toType));
    }
    var predicate;
    if (s.hasOwnProperty('minItems')) {
      predicate = and(predicate, fcomb.minLength(s.minItems));
    }
    if (s.hasOwnProperty('maxItems')) {
      predicate = and(predicate, fcomb.maxLength(s.maxItems));
    }
    return predicate ? subtype(Arr, predicate) : Arr;
  },

  null: function () {
    return t.irriducible('Null', function (x) {
      return x === null;
    });
  }

};

function toType(s) {
  assert(Obj.is(s));
  if (!s.hasOwnProperty('type')) {
    return t.Any;
  }
  var type = s.type;
  if (Type.is(type)) {
    return types[s.type](s);
  } else if (Arr.is(type)) {
    return t.union(type.map(function (type) {
      return types[type](s);
    }));
  }
  t.fail(t.util.format('unhandled %j', s));
}

module.exports = toType;