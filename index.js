'use strict';

var t = require('tcomb');
var fcomb = require('fcomb');
var util = require('./util');

var SchemaType = t.enums.of(
  'null string number integer boolean object array',
  'SchemaType'
);

function and(f, g) {
  return f ? fcomb.and(f, g) : g;
}

var types = {
  string: function(s) {
    var type = t.String;
    if (s.hasOwnProperty('enum')) {
      if (t.Array.is(s['enum'])) {
        return t.enums.of(s['enum']);
      } else {
        return t.enums(s['enum']);
      }
    }
    var predicate;
    if (s.hasOwnProperty('minLength')) {
      predicate = and(predicate, fcomb.minLength(s.minLength));
    }
    if (s.hasOwnProperty('maxLength')) {
      predicate = and(predicate, fcomb.maxLength(s.maxLength));
    }
    if (s.hasOwnProperty('pattern')) {
      var patternMatch = /^\/(.+)\/([gimuy]*)$/.exec(s.pattern);
      if (patternMatch === null) {
        predicate = and(predicate, fcomb.regexp(new RegExp(s.pattern)));
      } else {
        predicate = and(
          predicate,
          fcomb.regexp(new RegExp(patternMatch[1], patternMatch[2]))
        );
      }
    }
    if (s.hasOwnProperty('format')) {
      t.assert(
        formats.hasOwnProperty(s.format),
        '[tcomb-json-schema] Missing format ' +
          s.format +
          ', use the (format, predicate) API'
      );
      predicate = and(predicate, formats[s.format]);
      if (
        s.format === 'date' ||
        s.format === 'date-time' ||
        s.format === 'time'
      ) {
        type = t.Date;
      }
    }
    return predicate ? t.subtype(type, predicate) : type;
  },

  number: function(s) {
    var predicate;
    if (s.hasOwnProperty('minimum')) {
      predicate = s.exclusiveMinimum
        ? and(predicate, fcomb.gt(s.minimum))
        : and(predicate, fcomb.gte(s.minimum));
    }
    if (s.hasOwnProperty('maximum')) {
      predicate = s.exclusiveMaximum
        ? and(predicate, fcomb.lt(s.maximum))
        : and(predicate, fcomb.lte(s.maximum));
    }
    if (s.hasOwnProperty('integer') && s.integer) {
      predicate = and(predicate, util.isInteger);
    }
    return predicate ? t.subtype(t.Number, predicate) : t.Number;
  },

  integer: function(s) {
    var predicate;
    if (s.hasOwnProperty('minimum')) {
      predicate = s.exclusiveMinimum
        ? and(predicate, fcomb.gt(s.minimum))
        : and(predicate, fcomb.gte(s.minimum));
    }
    if (s.hasOwnProperty('maximum')) {
      predicate = s.exclusiveMaximum
        ? and(predicate, fcomb.lt(s.maximum))
        : and(predicate, fcomb.lte(s.maximum));
    }
    return predicate ? t.subtype(util.Int, predicate) : util.Int;
  },

  boolean: function() {
    return t.Boolean;
  },

  object: function(s) {
    var props = {};
    var hasProperties = false;
    var required = {};
    if (s.required) {
      s.required.forEach(function(k) {
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

  array: function(s) {
    var type = t.Array;
    if (s.hasOwnProperty('items')) {
      var items = s.items;
      if (t.Object.is(items)) {
        type = t.list(transform(s.items));
      } else {
        return t.tuple(items.map(transform));
      }
    }
    var predicate;
    if (s.hasOwnProperty('minItems')) {
      predicate = and(predicate, fcomb.minLength(s.minItems));
    }
    if (s.hasOwnProperty('maxItems')) {
      predicate = and(predicate, fcomb.maxLength(s.maxItems));
    }
    return predicate ? t.subtype(type, predicate) : type;
  },

  null: function() {
    return util.Null;
  }
};

var registerTypes = {};

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
    return t.union(
      type.map(function(type) {
        return types[type](s);
      })
    );
  }

  if (registerTypes.hasOwnProperty(type)) {
    return registerTypes[type];
  }

  t.fail('[tcomb-json-schema] Unsupported json schema ' + t.stringify(s));
}

var formats = {};

transform.registerFormat = function registerFormat(format, predicate) {
  t.assert(
    !formats.hasOwnProperty(format),
    '[tcomb-json-schema] Duplicated format ' + format
  );
  formats[format] = predicate;
};

transform.resetFormats = function resetFormats() {
  formats = {};
};

transform.registerType = function registerType(typeName, type) {
  t.assert(
    !registerTypes.hasOwnProperty(typeName),
    '[tcomb-json-schema] Duplicated type ' + typeName
  );
  t.assert(
    !SchemaType.is(typeName),
    '[tcomb-json-schema] Reserved type ' + typeName
  );
  registerTypes[typeName] = type;
};

transform.resetTypes = function resetTypes() {
  registerTypes = {};
};

module.exports = transform;
