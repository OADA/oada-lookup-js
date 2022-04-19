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

import url from 'url';

import request, { HTTPError } from 'superagent';

import { OADAError } from '@oada/error';

// Fetch a Well-Known (RFC 5785) Resource. The hostname will automatically be
// parsed from any URL.
export async function wellKnown(
  hostname: string,
  suffix: string,
  { timeout = 1000 } = {}
) {
  // Parse hostname for just hostname parts
  const parts = url.parse(hostname, false, true);

  // Typical use: hostname = agcloud.com --> parts.path == "agcloud.com"...
  if (!parts.hostname) {
    parts.hostname = parts.path;
  }

  parts.protocol = 'https';
  parts.pathname = `/.well-known/${suffix}`;
  parts.path = null;
  parts.search = null;
  parts.query = null;
  parts.hash = null;

  const response = await request
    .get(url.format(parts))
    .accept('application/json')
    .timeout(timeout);

  // Make sure request was OK and that it was valid JSON (body was parsed)
  if (response.ok && Object.keys(response.body).length > 0) {
    return response.body as unknown;
  }

  if (response.ok) {
    throw new Error(`Invalid ${suffix} Well-Known`);
  }

  const { error } = response as { error: HTTPError };
  throw new OADAError(
    error.text,
    error.status,
    `${suffix} at ${hostname} not found`,
    error.path
  );
}

export interface JWK {
  kty: string;
}

export interface ClientRegistration {
  clientId: string;
  redirectURLs: string[];
  licenses: Array<{ id: string; name: string }>;
  keys: JWK[];
  name: string;
  contact: string;
  puc: string;
}

// Fetch a client registration from an OADA client id.
export async function clientRegistration(
  clientId: string,
  { timeout = 1000 } = {}
) {
  // Parse client id
  const cid = clientId.split('@');
  if (cid.length !== 2) {
    throw new Error('Invalid clientId');
  }

  const host = `https://${cid[1]}`;

  // Get the OADA configuration of where the client is hosted
  const config = (await wellKnown(host, 'oada-client-discovery', {
    timeout,
  })) as { client_discovery: string };
  // Verify the host support client discovery
  if (!config.client_discovery) {
    throw new Error('Host does not support client discovery');
  }

  // Discover the clients registration
  const response = await request
    .get(config.client_discovery)
    .query({ clientId })
    .accept('application/json')
    .timeout(timeout);

  if (response.ok && Object.keys(response.body).length > 0) {
    return response.body as ClientRegistration;
  }

  if (response.ok) {
    throw new Error('Invalid client registration');
  }

  const { error } = response as { error: HTTPError };
  throw new OADAError(error.text, error.status, 'Client not found', error.path);
}

// Fetch a JSON Web Key Set
export async function jwks(uri: string, { timeout = 1000 } = {}) {
  // Get JWKs document
  const response = await request
    .get(uri)
    .accept('application/json')
    .timeout(timeout);

  if (
    response.ok &&
    Object.keys(response.body).length > 0 &&
    response.body.keys
  ) {
    return response.body as { keys: JWK[] };
  }

  if (response.ok) {
    throw new Error('Invalid JWKs document');
  }

  const { error } = response as { error: HTTPError };
  throw new OADAError(
    error.text,
    error.status,
    'Client public keys not found',
    error.path
  );
}

// Fetch trusted client discovery providers list
export async function trustedCDP({ timeout = 1000 } = {}) {
  // Get trusted CDP list
  const response = await request
    .get('https://oada.github.io/oada-trusted-lists/client-discovery.json')
    .accept('text/plain')
    .timeout(timeout);

  if (response.ok && response.body.length > 0) {
    return response.body as string[];
  }

  if (response.ok) {
    throw new Error('Invalid trusted client discovery provider list');
  }

  const { error } = response as { error: HTTPError };
  throw new OADAError(
    error.text,
    error.status,
    'Trusted client discovery provider list not found',
    error.path
  );
}
