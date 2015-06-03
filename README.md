Transforms a JSON Schema to a type [tcomb](https://github.com/gcanti/tcomb) type.

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
