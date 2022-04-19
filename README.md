# @oada/lookup

[![Coverage Status](https://coveralls.io/repos/OADA/oada-lookup-js/badge.png?branch=master)](https://coveralls.io/r/OADA/oada-lookup-js?branch=master)
[![npm](https://img.shields.io/npm/v/@oada/lookup)](https://www.npmjs.com/package/@oada/lookup)
[![Downloads/week](https://img.shields.io/npm/dw/@oada/lookup.svg)](https://npmjs.org/package/@oada/lookup)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/OADA/oada-lookup-js)](LICENSE)

JavaScript utility library to lookup OADA documents such as [Well-Known (RFC 5785)][well-known] resource, e.g., oada-configuration, [openid-configuration][],
etc, and public OADA client registrations.

## Getting Started

### Installation

The library can be installed with `yarn` using

```sh
yarn add @oada/lookup
```

### Running the tests, coverage, and style checks

The libraries test can be ran with:

```sh
yarn test
```

### wellKnown(hostname, suffix, options, cb)

Fetch a [Well-Known (RFC 5785)][well-known] Resource. The hostname will
automatically be parsed from any URL.

#### Parameters

`hostname` {String} Hostname (or URL) hosting the Well-Known resource being
requested. Sub-domains and ports are be persevered; Protocol, path, query
parameters, and hash are dropped. It is assumed that the Well-Known resource is
hosted with TLS (https) _Pull Request appreciated_

[`suffix`][] {String} Well-Known resource suffix being requested.

`options` {Object} containing at least the following properties:

- `timeout` {Number} _Default: 1000_ Timeout before HTTP request fails in ms.

`cb` {Function} Result callback. It takes the form `function(err, resource) {}`.

#### Usage Example

```javascript
import { wellKnown } from '@oada/lookup';

const options = {
  timeout: 500,
};

const resource = await wellKnown(
  'provider.oada-dev.com',
  'oada-configuration',
  options
);
console.log(resource);
```

### clientRegistration(clientId, options, cb)

Fetch a client registration from an OADA client id.

#### Parameters

`clientId` {String} The OADA client id to lookup the client registration for. It
takes a form similar to email: `id@domain`.

`options` {Object} containing at least the following properties:

- `timeout` {Number} _Default: 1000_ Timeout before HTTP request fails in ms.

`cb` {Function} Result callback. It takes the form `function(err, registration){}`.

#### Usage Example

```javascript
import { clientRegistration } from '@oada/lookup';

const options = {
  timeout: 500,
};

const registration = await clientRegistration(
  'xJx82s@provider.oada-dev.com',
  options
);
console.log(registration);
```

### jwks(uri, options, cb)

Fetch a [Json Web Key Set (JWKS)][json-web-key-set] from an URI.

#### Parameters

`uri` {String} The URI containing the desired JWKS document. For example, the
value of the OpenID Connect openid-configuration `jwks_uri` property.

`options` {Object} containing at least the following properties:

- `timeout` {Number} _Default: 1000_ Timeout before HTTP request fails in ms.

`cb` {Function} Result callback. It takes the form `function(err, jwks){}`.

#### Usage Example

```javascript
import { jwks } from '@oada/lookup';

const options = {
  timeout: 500,
};

const JWKset = await jwks('provider.oada-dev.com/oidc/jwks', options);
console.log(JWKset);
```

## References

1. [Defining Well-Known Uniform Resource Identifiers (URIs)][well-known]
2. [OpenID Discovery](http://openid.net/specs/openid-connect-discovery-1_0.html)

[well-known]: http://tools.ietf.org/html/rfc5785
[openid-configuration]: http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
[`suffix`]: http://tools.ietf.org/html/rfc5785#section-5.1.1 'RFC5785 Section 5.1.1'
[json-web-key-set]: https://tools.ietf.org/html/draft-ietf-jose-json-web-key-33#page-10
