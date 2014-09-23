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
var getKind = t.util.getKind;

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

    describe('format property', function () {

      it('should handle email', function () {
        var Type = toType({
          type: 'string',
          format: 'email'
        });
        eq(getKind(Type), 'subtype');
        eq(Type.meta.type, Str);
        eq(Type.meta.predicate('a@b.it'), true);
        eq(Type.meta.predicate('aaa'), false);
      });

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

  describe('number schema', function () {

    it('should translate a simple schema', function () {
      eq(toType({type: 'object'}), Obj);
    });

    it('should translate a simple schema', function () {
      var Type = toType({
        type: 'object',
        properties: {
          a: {type: 'string'},
          b: {type: 'number'}
        }
      });
      ok(Type.meta.props.a === Str);
      ok(Type.meta.props.b === Num);
    });

  });

  it('should translate a array schema', function () {
    eq(toType({type: 'array'}), Arr);
  });

  it('should translate a [string, number] schema', function () {
    var Type = toType({type: ["number", "string"]});
    eq(getKind(Type), 'union');
    ok(Type.meta.types[0] === Num);
    ok(Type.meta.types[1] === Str);
  });

});
