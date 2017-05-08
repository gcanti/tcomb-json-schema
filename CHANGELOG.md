# Changelog

> **Tags:**
> - [New Feature]
> - [Bug Fix]
> - [Spec Compliancy]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]

**Note**: Gaps between patch versions are faulty/broken releases.

## v0.3.1

- **Bug fix**
  - Fix isInteger(null) === true, https://github.com/gcanti/tcomb-json-schema/pull/26 (@sastred)

## v0.3.0

**Warning**. If you don't rely in your codebase on the property `maybe(MyType)(undefined) === null` this **is not a breaking change** for you.

- **Breaking Change**
  - upgrade to `tcomb` v3.0.0

## v0.2.5

- **New Feature**
  - Added possibility to define patterns with regex flags (thanks @emiloberg)

## v0.2.4

- **New Feature**
  - Added possibility to define enums as objects to carry a value/label pair (thanks @emiloberg)

## v0.2.3

- **Bug Fix**
  - `minItems` and `maxItems` have no effect for `array`s of objects, fix #18 (thanks @WeweTom)

## v0.2.2

- **Bug Fix**
  - IE8 error with 'null' type, fix #17

## v0.2.1

- **New Feature**
  - Registering a type or structure instead of just a format, fix #13 (thanks @damienleroux)

## v0.2.0

- **Breaking Change**
  + upgrade to tcomb v2.2

## v0.1.4

- **Internal**
  + Optimized `integer` type (@chriskjaer idea)

## v0.1.3

- **New Feature**
  + Support format property for string types #6 (@oliger idea)
  + Support integer type #5 (@chriskjaer idea)
- **Bug Fix**
  + Removed `t.util.format`
- **Internal**
  + Optimized `Null` type
- **Polish**
  + Formatted CHANGELOG

## v0.1.2

- **Internal**
  + Upgrade to latest `tcomb`
  + Move `tcomb` to `peerDependencies`

## v0.1.1

- **Internal**
  + Upgrade to latest `tcomb`
