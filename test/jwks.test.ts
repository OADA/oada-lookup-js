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

import { jwks } from '../dist';

import sampleJWKs from './sample/jwks.json';

const mockUrl = 'https://oada.local';

test.afterEach(() => {
  nock.cleanAll();
});

test('should be exported', (t) => {
  t.is(typeof jwks, 'function');
});

test('should fetch document', async (t) => {
  nock(mockUrl).get('/jwks').reply(200, sampleJWKs);

  const keys = await jwks(`${mockUrl}/jwks`);
  t.deepEqual(keys, sampleJWKs);
});

test('should fail if non-existent', async (t) => {
  nock(mockUrl).get('/jwks').reply(404);

  const error = await t.throwsAsync(jwks(`${mockUrl}/jwks`));
  // @ts-expect-error status
  t.is(error?.status, 404);
});

test('should fail if not valid', async (t) => {
  nock(mockUrl).get('/jwks').reply(200, 'Invalid Response');

  const error = await t.throwsAsync(jwks(`${mockUrl}/jwks`));
  t.regex(error!.message, /Invalid JWKs document/);
});

test('should fail after timeout', async (t) => {
  const options = {
    timeout: 10,
  };

  nock(mockUrl)
    .get('/jwks')
    .delayConnection(2 * options.timeout)
    .reply(200, sampleJWKs);

  const error = await t.throwsAsync(jwks(`${mockUrl}/jwks`, options));
  // @ts-expect-error timeout
  t.is(error?.timeout, options.timeout);
});
