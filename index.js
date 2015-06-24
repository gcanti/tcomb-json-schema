'use strict';

var t = require('tcomb');
var fcomb = require('fcomb');
var util = require('./util');

var SchemaType = t.enums.of('null string number integer boolean object array', 'SchemaType');

function and(f, g) {
  return f ? fcomb.and(f, g) : g;
}

var types = {

  string: function (s) {
    if (s.hasOwnProperty('enum')) {
      return t.enums.of(s['enum']);
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
    if (s.hasOwnProperty('format') && formats.hasOwnProperty(s.format)) {
      predicate = and(predicate, formats[s.format]);
    }
    return predicate ? t.subtype(t.String, predicate) : t.String;
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
      predicate = and(predicate, util.isInteger);
    }
    return predicate ? t.subtype(t.Number, predicate) : t.Number;
  },

  integer: function (s) {
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
    return predicate ? t.subtype(util.Int, predicate) : util.Int;
  },

  boolean: function (s) {
    return t.Boolean;
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
        var type = transform(s.properties[k]);
        props[k] = required[k] || type === t.Boolean ? type : t.maybe(type);
      }
    }
    return hasProperties ? t.struct(props, s.description) : t.Object;
  },

  array: function (s) {
    if (s.hasOwnProperty('items')) {
      var items = s.items;
      if (t.Object.is(items)) {
        return t.list(transform(s.items));
      }
      return t.tuple(items.map(transform));
    }
    var predicate;
    if (s.hasOwnProperty('minItems')) {
      predicate = and(predicate, fcomb.minLength(s.minItems));
    }
    if (s.hasOwnProperty('maxItems')) {
      predicate = and(predicate, fcomb.maxLength(s.maxItems));
    }
    return predicate ? t.subtype(t.Array, predicate) : t.Array;
  },

  null: function () {
    return util.Null;
  }

};

function transform(s) {
  t.assert(t.Object.is(s));
  if (!s.hasOwnProperty('type')) {
    return t.Any;
  }
  var type = s.type;
  if (SchemaType.is(type)) {
    return types[type](s);
  }
  if (t.Array.is(type)) {
    return t.union(type.map(function (type) {
      return types[type](s);
    }));
  }
  t.fail('[tcomb-json-schema] Unsupported json schema ' + t.stringify(s));
}

var formats = {};

transform.registerFormat = function registerFormat(format, predicate) {
  t.assert(!formats.hasOwnProperty(format), '[tcomb-json-schema] Duplicated format ' + format);
  formats[format] = predicate;
};

transform.resetFormats = function resetFormats() {
  formats = {};
};

module.exports = transform;
