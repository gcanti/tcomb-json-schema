Transforms a JSON Schema to a type [tcomb](https://github.com/gcanti/tcomb) type.

# Playground

If you want to get a general feel for how this works please head over to https://gcanti.github.io/resources/json-schema-to-tcomb/playground/playground.html

# API

## transform(schema: JSONSchema): Type

**Example**

```js
var transform = require('tcomb-json-schema');

var TcombType = transform({
  "type": "string",
  "enum": ["Street", "Avenue", "Boulevard"]
});
```

## registerFormat(format: string, predicate: (x: any) => boolean): void

Registers a new format.

**Example**

```js
function isEmail(x) {
  return /(.)+@(.)+/.test(x);
}

transform.registerFormat('email', isEmail);

var TcombType = transform({
  "type": "string",
  "format": 'email'
});
```

## resetFormats(): void

Removes all registered formats.

```js
transform.resetFormats();
```

## registerType(typeName: string, type: tComb Supported types): void

Registers a new type.

**Example**

```js
var Str10 = t.subtype(t.Str, function (s) {
  return s.length <= 10;
}, 'Str10');

transform.registerType('string10', Str10);

var TcombType = transform({
  type: "string10"
});
```

## resetTypes(): void

Removes all registered types.

```js
transform.resetTypes();
```

# JSON Schema

## enums

If you don't care of values you can describe enums as an array:


```js
"street_type": { 
  "type": "string",
  "enum": ["Street", "Avenue", "Boulevard"]
}
```

or if you want to specify values, describe it as an object where the keys are the values:

```js
"street_type": { 
  "type": "string",
  "enum": {
    st: "Street", 
    ave: "Avenue", 
    blvd: "Boulevard"
  }
}
```
