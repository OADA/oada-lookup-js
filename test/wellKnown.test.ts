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

/* eslint-disable sonarjs/no-duplicate-string */

import test from 'ava';

import nock from 'nock';

import { wellKnown } from '../dist';

import oadaConfig from './sample/oada-configuration.json';

const mockUrl = 'https://oada.local';
const mockHost = 'oada.local';

test.afterEach(() => {
  nock.cleanAll();
});

test('should be exported', (t) => {
  t.is(typeof wellKnown, 'function');
});

test('should fetch document', async (t) => {
  nock(mockUrl).get('/.well-known/oada-configuration').reply(200, oadaConfig);

  const config = await wellKnown(mockHost, 'oada-configuration');
  t.deepEqual(config, oadaConfig);
});

test('should fetch document from URL', async (t) => {
  nock(mockUrl).get('/.well-known/oada-configuration').reply(200, oadaConfig);

  const config = await wellKnown(
    `http://${mockHost}/a?b=c#d`,
    'oada-configuration'
  );
  t.deepEqual(config, oadaConfig);
});

test('should fail if non-existent', async (t) => {
  nock(mockUrl).get('/.well-known/oada-configuration').reply(404);

  const error = await t.throwsAsync(wellKnown(mockHost, 'oada-configuration'));
  // @ts-expect-error status
  t.is(error?.status, 404);
});

test('should fail if not valid', async (t) => {
  nock(mockUrl)
    .get('/.well-known/oada-configuration')
    .reply(200, 'Invalid Response');

  const error = await t.throwsAsync(wellKnown(mockHost, 'oada-configuration'));
  t.regex(error!.message, /Invalid oada-configuration Well-Known/);
});

test('should fail after timeout', async (t) => {
  const options = {
    timeout: 10,
  };

  nock(mockUrl)
    .get('/.well-known/oada-configuration')
    .delayConnection(2 * options.timeout)
    .reply(200, oadaConfig);

  const error = await t.throwsAsync(
    wellKnown(mockHost, 'oada-configuration', options)
  );
  // @ts-expect-error timout
  t.is(error?.timeout, options.timeout);
});
