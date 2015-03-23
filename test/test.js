"use strict";
var assert = require('assert');
var t = require('tcomb');
var toType = require('../index');

var Str = t.Str;
var Num = t.Num;
var Bool = t.Bool;
var Obj = t.Obj;
var Arr = t.Arr;
var Any = t.Any;
var getKind = function (type) {
  return type.meta.kind;
};

//
// setup
//

var ok = function (x) { assert.strictEqual(true, x); };
var ko = function (x) { assert.strictEqual(false, x); };
var eq = assert.strictEqual;

describe('toType', function () {

  it('should translate an empty schema', function () {
    eq(toType({}), Any);
  });

  describe('string schema', function () {

    it('should translate a simple schema', function () {
      eq(toType({type: 'string'}), Str);
    });

    it('should handle enum', function () {
      var Type = toType({
        type: 'string',
        'enum': ["Street", "Avenue", "Boulevard"]
      });
      eq(getKind(Type), 'enums');
      eq(Type.is('a'), false);
      eq(Type.is('Street'), true);
    });

    it('should handle minLength', function () {
      var Type = toType({
        type: 'string',
        minLength: 2
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Str);
      eq(Type.meta.predicate('a'), false);
      eq(Type.meta.predicate('aa'), true);
    });

    it('should handle maxLength', function () {
      var Type = toType({
        type: 'string',
        maxLength: 2
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Str);
      eq(Type.meta.predicate('aa'), true);
      eq(Type.meta.predicate('aaa'), false);
    });

    it('should handle pattern', function () {
      var Type = toType({
        type: 'string',
        pattern: '^h'
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Str);
      eq(Type.meta.predicate('hello'), true);
      eq(Type.meta.predicate('aaa'), false);
    });

  });

  describe('number schema', function () {

    it('should translate a simple schema', function () {
      eq(toType({type: 'number'}), Num);
    });

    it('should handle minimum', function () {
      var Type = toType({
        type: 'number',
        minimum: 2
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Num);
      eq(Type.meta.predicate(1), false);
      eq(Type.meta.predicate(2), true);
      eq(Type.meta.predicate(3), true);
    });

    it('should handle exclusiveMinimum', function () {
      var Type = toType({
        type: 'number',
        minimum: 2,
        exclusiveMinimum: true
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Num);
      eq(Type.meta.predicate(1), false);
      eq(Type.meta.predicate(2), false);
      eq(Type.meta.predicate(3), true);
    });

    it('should handle maximum', function () {
      var Type = toType({
        type: 'number',
        maximum: 2
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Num);
      eq(Type.meta.predicate(1), true);
      eq(Type.meta.predicate(2), true);
      eq(Type.meta.predicate(3), false);
    });

    it('should handle exclusiveMaximum', function () {
      var Type = toType({
        type: 'number',
        maximum: 2,
        exclusiveMaximum: true
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Num);
      eq(Type.meta.predicate(1), true);
      eq(Type.meta.predicate(2), false);
      eq(Type.meta.predicate(3), false);
    });

    it('should handle integer', function () {
      var Type = toType({
        type: 'number',
        integer: true
      });
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Num);
      eq(Type.meta.predicate(1), true);
      eq(Type.meta.predicate(1.1), false);
    });

  });

  it('should translate a null schema', function () {
    var Type = toType({type: 'null'});
    ok(Type.is(null));
    ko(Type.is(undefined));
    ko(Type.is('a'));
  });

  it('should translate a boolean schema', function () {
    eq(toType({type: 'boolean'}), Bool);
  });

  describe('object schema', function () {

    it('should translate a simple schema', function () {
      eq(toType({type: 'object'}), Obj);
    });

    it('should handle optional properties', function () {
      var Type = toType({
        type: 'object',
        properties: {
          a: {type: 'string'},
          b: {type: 'number'}
        }
      });
      var a = Type.meta.props.a;
      var b = Type.meta.props.b;
      eq(getKind(a), 'maybe');
      ok(a.meta.type === Str);
      eq(getKind(b), 'maybe');
      ok(b.meta.type === Num);
    });

    it('should handle required properties', function () {
      var Type = toType({
        type: 'object',
        properties: {
          a: {type: 'string'},
          b: {type: 'number'}
        },
        required: ['a']
      });
      var a = Type.meta.props.a;
      var b = Type.meta.props.b;
      eq(getKind(a), 'irreducible');
      ok(a === Str);
      eq(getKind(b), 'maybe');
      ok(b.meta.type === Num);
    });

  });

  describe('array schema', function () {

    it('should translate a simple schema', function () {
      eq(toType({type: 'array'}), Arr);
    });

    it('should handle minItems', function () {
      var Type = toType({type: 'array', minItems: 1});
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Arr);
      eq(Type.meta.predicate([]), false);
      eq(Type.meta.predicate(['a']), true);
    });

    it('should handle maxItems', function () {
      var Type = toType({type: 'array', maxItems: 2});
      eq(getKind(Type), 'subtype');
      eq(Type.meta.type, Arr);
      eq(Type.meta.predicate(['a', 'b']), true);
      eq(Type.meta.predicate(['a', 'b', 'c']), false);
    });

    it('should handle items as list', function () {
      var Type = toType({
        type: 'array',
        items: {
          type: 'number'
        }
      });
      eq(getKind(Type), 'list');
      ok(Type.meta.type === Num);
    });

    it('should handle items as tuple', function () {
      var Type = toType({
        type: 'array',
        items: [
          {type: 'string'},
          {type: 'number'}
        ]
      });
      eq(getKind(Type), 'tuple');
      ok(Type.meta.types[0] === Str);
      ok(Type.meta.types[1] === Num);
    });

  });

  it('should handle unions', function () {
    var Type = toType({type: ["number", "string"]});
    eq(getKind(Type), 'union');
    ok(Type.meta.types[0] === Num);
    ok(Type.meta.types[1] === Str);
  });

});
