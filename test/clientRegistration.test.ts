/**
 * @license
 * Copyright 2014-2022 Open Ag Data Alliance
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

import test from 'ava';

import nock from 'nock';

import { clientRegistration } from '../dist';

import clientReg from './sample/client-registration.json';
import oadaClientDiscovery from './sample/oada-client-discovery.json';
import oadaConfig from './sample/oada-configuration.json';

const mockUrl = 'https://oada.local';

test.beforeEach(() => {
  nock(mockUrl)
    .get('/.well-known/oada-client-discovery')
    .reply(200, oadaClientDiscovery);
});

const clientId = '123@oada.local';

test.afterEach(() => {
  nock.cleanAll();
});

test('should exported', (t) => {
  t.is(typeof clientRegistration, 'function');
});

test('should fetch registration', async (t) => {
  nock(mockUrl)
    .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
    .get('/discover?clientId=XXX')
    .reply(200, clientReg);

  const config = await clientRegistration(clientId);
  t.deepEqual(config, clientReg);
});

test('should fail if non-existent', async (t) => {
  nock(mockUrl)
    .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
    .get('/discover?clientId=XXX')
    .reply(404);

  const error = await t.throwsAsync(clientRegistration(clientId));
  // @ts-expect-error status
  t.is(error?.status, 404);
});

test('should fail if invalid', async (t) => {
  nock(mockUrl)
    .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
    .get('/discover?clientId=XXX')
    .reply(200, 'Invalid Response');

  const error = await t.throwsAsync(clientRegistration(clientId));
  t.regex(error!.message, /Invalid client registration/);
});

test('should fail after timeout', async (t) => {
  const options = {
    timeout: 10,
  };

  nock(mockUrl)
    .filteringPath(/clientId=[^&]*/g, 'clientId=XXX')
    .get('/discover?clientId=XXX')
    .delayConnection(2 * options.timeout)
    .reply(200, clientReg);

  const error = await t.throwsAsync(clientRegistration(clientId, options));
  // @ts-expect-error timout
  t.is(error?.timeout, options.timeout);
});

test('should fail if clientId is invalid', async (t) => {
  const error = await t.throwsAsync(clientRegistration('123'));
  t.regex(error!.message, /Invalid clientId/);
});

test('should fail if provider does not support discovery', async (t) => {
  // Disable client discovery
  // @ts-expect-error IDEK
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment
  const { client_discovery, ...config } = oadaConfig;
  nock.cleanAll();
  nock(mockUrl).get('/.well-known/oada-client-discovery').reply(200, config);

  const error = await t.throwsAsync(clientRegistration(clientId));
  t.regex(error!.message, /does not support client discovery/);
});

test('should fail if OADA configuration cannot be found', async (t) => {
  nock.cleanAll();

  nock(mockUrl).get('/.well-known/oada-client-discovery').reply(404);

  const options = {
    timeout: 10,
  };

  const error = await t.throwsAsync(clientRegistration(clientId, options));
  // @ts-expect-error status
  t.is(error?.status, 404);
});
