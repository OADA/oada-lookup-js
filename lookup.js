/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var url = require('url');
var request = require('superagent');

// Fetch a Well-Known (RFC 5785) Resource. The hostname will automatically be
// parsed from any URL.
function wellKnown(hostname, suffix, options, cb) {
  // Check for options object
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  // Default options
  options.timeout = options.timeout || 1000;

  // Parse hostname for just hostname parts
  var parts = url.parse(hostname, false, true);

  // Typical use: hostname = agcloud.com --> parts.path == "agcloud.com"...
  if (!parts.hostname) {
    parts.hostname = parts.path;
  }
  parts.protocol = 'https';
  parts.pathname = '/.well-known/' + suffix;
  parts.path = null;
  parts.search = null;
  parts.query = null;
  parts.hash = null;

  request
    .get(url.format(parts))
    .accept('application/json')
    .timeout(options.timeout)
    .end(function(err, res) {
      if (err) { return cb(err); }

      // Makre sure request was OK and that it was valid JSON (body was parsed)
      if (res.ok && Object.keys(res.body).length) {
        cb(null, res.body);
      } else if (res.ok) {
        cb(new Error('Invalid ' + suffix + ' Well-Known'));
      } else {
        cb(res.error);
      }
    });
}

// Fetch a client registration from an OADA client id.
function clientRegistration(clientId, options, cb) {
  // Check for options object
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  // Default options
  options.timeout = options.timeout || 1000;

  // Parse client id
  var cid = clientId.split('@');
  if (cid.length != 2) {
    return cb(new Error('Invalid clientId'));
  }

  var host = 'https://' + cid[1];

  // Get the OADA configuration of where the client is hosted
  wellKnown(host, 'oada-configuration',  options, function(err, conf) {
    if (err) { return cb(err); }

    // Verify the host support client discovery
    if (!conf.clientDiscovery) {
      return cb(new Error('Host does not support client discovery'));
    }

    // Discover the clients registration
    request
      .get(conf.clientDiscovery)
      .query({'clientId': clientId})
      .accept('applcation/json')
      .timeout(options.timeout)
      .end(function(err, res) {
        if (err) { return cb(err); }

        if (res.ok && Object.keys(res.body).length) {
          cb(null, res.body);
        } else if (res.ok) {
          cb(new Error('Invalid client registration'));
        } else {
          cb(res.error);
        }
      });
  });
}

// Fetch a JSON Web Key Set
function jwks(uri, options, cb) {
  // Check for options object
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  // Default options
  options.timeout = options.timeout || 1000;

  // Get JWKs document
  request
    .get(uri)
    .accept('application/json')
    .timeout(options.timeout)
    .end(function(err, res) {
      if (err) { return cb(err); }

      if (res.ok && Object.keys(res.body).length && res.body.keys) {
        cb(null, res.body);
      } else if (res.ok) {
        cb(new Error('Invalid JWKs document'));
      } else {
        cb(res.error);
      }
    });
}

// Fetch trsuted client discovery providers list
function trustedCDP(options, cb) {
  // Check for options object
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  // Default options
  options.timeout = options.timeout || 1000;

  // Get trusted CDP list
  request
    .get('https://raw.githubusercontent.com/OADA/oada-trusted-lists/master/' +
        'client-discovery.json')
    .accept('text/plain')
    .timeout(options.timeout)
    .end(function(err, res) {
      if (err) { return cb(err); }

      if (res.ok) {
        try {
          cb(null, JSON.parse(res.text));
        } catch (e) {
          cb(new Error('Invalid trusted client discovery provider list'));
        }
      } else {
        cb(res.error);
      }
    });
}

module.exports.wellKnown = wellKnown;
module.exports.clientRegistration = clientRegistration;
module.exports.jwks = jwks;
module.exports.trustedCDP = trustedCDP;
