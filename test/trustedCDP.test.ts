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

import { trustedCDP } from '../dist';

import sampleCDP from './sample/client-discovery.json';

test.afterEach(() => {
  nock.cleanAll();
});

test('should be exported', (t) => {
  t.is(typeof trustedCDP, 'function');
});

test('should fetch document', async (t) => {
  nock('https://oada.github.io')
    .get('/oada-trusted-lists/client-discovery.json')
    .reply(200, sampleCDP);

  const keys = await trustedCDP();
  t.deepEqual(keys, sampleCDP);
});

test('should fail if non-existent', async (t) => {
  nock('https://oada.github.io')
    .get('/oada-trusted-lists/client-discovery.json')
    .reply(404);

  const error = await t.throwsAsync(trustedCDP());
  // @ts-expect-error status
  t.is(error?.status, 404);
});

test('should fail if not valid', async (t) => {
  nock('https://oada.github.io')
    .get('/oada-trusted-lists/client-discovery.json')
    .reply(200, 'Invalid Response');

  const error = await t.throwsAsync(trustedCDP());
  t.regex(error!.message, /Invalid trusted client discovery provider list/);
});

test('should fail after timeout', async (t) => {
  const options = {
    timeout: 10,
  };

  nock('https://oada.github.com')
    .get('/oada-trusted-lists/client-discovery.json')
    .delayConnection(2 * options.timeout)
    .reply(200, sampleCDP);

  const error = await t.throwsAsync(trustedCDP(options));
  // @ts-expect-error timeout
  t.is(error?.timeout, options.timeout);
});
