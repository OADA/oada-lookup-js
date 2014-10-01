[![Build Status](https://travis-ci.org/OADA/oada-lookup-js.svg)](https://travis-ci.org/OADA/oada-lookup-js)
[![Coverage Status](https://coveralls.io/repos/OADA/oada-lookup-js/badge.png?branch=master)](https://coveralls.io/r/OADA/oada-lookup-js?branch=master)
[![Dependency Status](https://david-dm.org/oada/oada-lookup-js.svg)](https://david-dm.org/oada/oada-lookup-js)
[![License](http://img.shields.io/:license-Apache%202.0-green.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

oada-lookup-js
==============
JavaScript utility library to lookup OADA documents such as [Well-Known (RFC
5785)][well-known] resource, e.g., oada-configuration, openid-configuration,
etc, and public OADA client registrations.

Getting Started
---------------

### Installation ###
The library can be installed with `npm` using
```sh
$ npm install oada-lookup
```

### Running the tests ###
The libraries test are run as a gulp task
```sh
$ gulp test
```

The coverage report is also generated with a gulp task
```sh
$ gulp cover
```

### wellKnown(hostname, suffix, options, cb) ###
Fetch a [Well-Known (RFC 5785)][well-known] Resource. The hostname will
automatically be parsed from any URL.

#### Parameters ####
`hostname` {String} Hostname (or URL) hosting the Well-Known resource being
requested. Sub-domains and ports are be persevered; Protocol, path, query
parameters, and hash are dropped. It is assumed that the Well-Known resource is
hosted with TLS (https) *Pull Request appreciated*

[`suffix`][] {String} Well-Known resource suffix being requested.

`options` {Object} containing at least the following properties:

* `timeout` {Number} *Default: 1000* Timeout before HTTP request fails in ms.

`cb` {Function} Result callback. It takes the form `function(err, resource) {}`.

#### Usage Example ####
```javascript
var lookup = require('oada-lookup');

var options = {
  timeout: 500
};

lookup.wellKnown('provider.oada-dev.com', 'oada-configuration', options,
  function(err, resource) {
    console.log(err);
    console.log(resource);
  });
```

### clientRegistration(clientId, options, cb) ###
Fetch a client registration from an OADA client id.

#### Parameters ####
`clientId` {String} The OADA client id to lookup the client registration for. It
takes a form similar to email: `id@domain`.

`options` {Object} containing at least the following properties:

* `timeout` {Number} *Default: 1000* Timeout before HTTP request fails in ms.

`cb` {Function} Result callback. It takes the form `function(err, registration){}`.

#### Usage Example ####
```javascript
var lookup = require('oada-lookup');

var options = {
  timeout: 500
};

lookup.clientRegistration('xJx82s@provider.oada-dev.com', options,
  function(err, registration) {
    console.log(err);
    console.log(registration);
  });
```

References
----------

[well-known]: http://tools.ietf.org/html/rfc5785
1. [Defining Well-Known Uniform Resource Identifiers (URIs)][well-known]

[`suffix`]: http://tools.ietf.org/html/rfc5785#section-5.1.1 "RFC5785 Section 5.1.1"
