/*
 * Copyright 2014 Open Ag Data Alliance
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
/*global describe, it, afterEach, beforeEach */
/*jshint expr:true */
'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var lookup = require('../lookup');

var oadaConfig = require('./sample/oada-configuration');
var oadaClientDiscovery = require('./sample/oada-client-discovery');
var clientReg = require('./sample/client-registration');
var jwks = require('./sample/jwks');
var trustedCDP = require('./sample/client-discovery');

var mockUrl = 'https://oada.local';
var mockHost = 'oada.local';

describe('lookup', function() {

  describe('#wellKnown', function() {

    afterEach(function() {
      nock.cleanAll();
    });

    it('should be exported', function() {
      expect(lookup.wellKnown).to.be.a.function;
    });

    it('should fetch document', function(done) {
      nock(mockUrl)
        .get('/.well-known/oada-configuration')
        .reply(200, oadaConfig);

      lookup.wellKnown(mockHost, 'oada-configuration', function(err, conf) {
        expect(err).to.not.be.ok;
        expect(conf).to.deep.equal(oadaConfig);

        done();
      });
    });

    it('should fetch document from URL', function(done) {
      nock(mockUrl)
        .get('/.well-known/oada-configuration')
        .reply(200, oadaConfig);

      lookup.wellKnown('http://' + mockHost + '/a?b=c#d', 'oada-configuration',
        function(err, conf) {
          expect(err).to.not.be.ok;
          expect(conf).to.deep.equal(oadaConfig);

          done();
        }
      );
    });

    it('should fail if non-existent', function(done) {
      nock(mockUrl)
        .get('/.well-known/oada-configuration')
        .reply(404);

      lookup.wellKnown(mockHost, 'oada-configuration', function(err) {
        expect(err.status).to.match(/Not Found/);

        done();
      });
    });

    it('should fail if not valid', function(done) {
      nock(mockUrl)
        .get('/.well-known/oada-configuration')
        .reply(200, 'Invalid Response');

      lookup.wellKnown(mockHost, 'oada-configuration', function(err) {
        expect(err).to.match(/Invalid oada-configuration Well-Known/);

        done();
      });
    });

    it('should fail after timeout', function(done) {
      var options = {
        timeout: 10,
      };

      nock(mockUrl)
        .get('/.well-known/oada-configuration')
        .delayConnection(2 * options.timeout)
        .reply(200, oadaConfig);

      lookup.wellKnown(mockHost, 'oada-configuration', options, function(err) {
        expect(err.timeout).to.equal(options.timeout);

        done();
      });
    });
  });

  describe('#clientRegistration', function() {
    var clientId = '123@oada.local';

    beforeEach(function() {
      nock(mockUrl)
        .get('/.well-known/oada-client-discovery')
        .reply(200, oadaClientDiscovery);
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should exported', function() {
      expect(lookup.clientRegistration).to.be.a.function;
    });

    it('should fetch registration', function(done) {
      nock(mockUrl)
        .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
        .get('/discover?clientId=XXX')
        .reply(200, clientReg);

      lookup.clientRegistration(clientId, function(err, config) {
        expect(err).to.not.be.ok;
        expect(config).to.deep.equal(clientReg);

        done();
      });
    });

    it('should fail if non-existent', function(done) {
      nock(mockUrl)
        .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
        .get('/discover?clientId=XXX')
        .reply(404);

      lookup.clientRegistration(clientId, function(err) {
        expect(err.status).to.match(/Not Found/);

        done();
      });
    });

    it('should fail if invalid', function(done) {
      nock(mockUrl)
        .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
        .get('/discover?clientId=XXX')
        .reply(200, 'Invalid Reponse');

      lookup.clientRegistration(clientId, function(err) {
        expect(err).to.match(/Invalid client registration/);

        done();
      });
    });

    it('should fail after timeout', function(done) {
      var options = {
        timeout: 10
      };

      nock(mockUrl)
        .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
        .get('/discover?clientId=XXX')
        .delayConnection(2 * options.timeout)
        .reply(200, clientReg);

      lookup.clientRegistration(clientId, options, function(err) {
        expect(err.timeout).to.equal(options.timeout);

        done();
      });
    });

    it('should fail if clientId is invalid', function(done) {
      lookup.clientRegistration('123', function(err) {
        expect(err).to.match(/Invalid clientId/);

        done();
      });
    });

    it('should fail if provider does not support discovery', function(done) {
      // Disable client discovery
      var config = JSON.parse(JSON.stringify(oadaConfig));
      delete config['client_discovery'];
      nock.cleanAll();
      nock(mockUrl)
        .get('/.well-known/oada-client-discovery')
        .reply(200, config);

      lookup.clientRegistration(clientId, function(err) {
        expect(err).to.match(/does not support client discovery/);

        done();
      });
    });

    it('should fail if OADA configuration cannot be found', function(done) {
      nock.cleanAll();

      nock(mockUrl)
        .get('/.well-known/oada-client-discovery')
        .reply(404);

      var options = {
        timeout: 10
      };

      lookup.clientRegistration(clientId, options, function(err) {
        expect(err.status).to.match(/Not Found/);

        done();
      });
    });
  });

  describe('#jwks', function() {

    afterEach(function() {
      nock.cleanAll();
    });

    it('should be exported', function() {
      expect(lookup.jwks).to.be.a.function;
    });

    it('should fetch document', function(done) {
      nock(mockUrl)
        .get('/jwks')
        .reply(200, jwks);

      lookup.jwks(mockUrl + '/jwks', function(err, keys) {
        expect(err).to.not.be.ok;
        expect(keys).to.deep.equal(jwks);

        done();
      });
    });

    it('should fail if non-existent', function(done) {
      nock(mockUrl)
        .get('/jwks')
        .reply(404);

      lookup.jwks(mockUrl + '/jwks', function(err) {
        expect(err.status).to.match(/Not Found/);

        done();
      });
    });

    it('should fail if not valid', function(done) {
      nock(mockUrl)
        .get('/jwks')
        .reply(200, 'Invalid Response');

      lookup.jwks(mockUrl + '/jwks', function(err) {
        expect(err).to.match(/Invalid JWKs document/);

        done();
      });
    });

    it('should fail after timeout', function(done) {
      var options = {
        timeout: 10,
      };

      nock(mockUrl)
        .get('/jwks')
        .delayConnection(2 * options.timeout)
        .reply(200, jwks);

      lookup.jwks(mockUrl + '/jwks', options, function(err) {
        expect(err.timeout).to.equal(options.timeout);

        done();
      });
    });
  });

  describe('#trustedCDP', function() {

    afterEach(function() {
      nock.cleanAll();
    });

    it('should be exported', function() {
      expect(lookup.trustedCDP).to.be.a.function;
    });

    it('should fetch document', function(done) {
      nock('https://oada.github.io')
        .get('/oada-trusted-lists/client-discovery.json')
        .reply(200, trustedCDP);

      lookup.trustedCDP(function(err, keys) {
        expect(err).to.not.be.ok;
        expect(keys).to.deep.equal(trustedCDP);

        done();
      });
    });

    it('should fail if non-existent', function(done) {
      nock('https://oada.github.io')
        .get('/oada-trusted-lists/client-discovery.json')
        .reply(404);

      lookup.trustedCDP(function(err) {
        expect(err.status).to.match(/Not Found/);

        done();
      });
    });

    it('should fail if not valid', function(done) {
      nock('https://oada.github.io')
        .get('/oada-trusted-lists/client-discovery.json')
        .reply(200, 'Invalid Response');

      lookup.trustedCDP(function(err) {
        expect(err).to.match(/Invalid trusted client discovery provider list/);

        done();
      });
    });

    it('should fail after timeout', function(done) {
      var options = {
        timeout: 10,
      };

      nock('https://oada.github.com')
        .get('/oada-trusted-lists/client-discovery.json')
        .delayConnection(2 * options.timeout)
        .reply(200, trustedCDP);

      lookup.trustedCDP(options, function(err) {
        expect(err.timeout).to.equal(options.timeout);

        done();
      });
    });
  });
});
