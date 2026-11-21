import createClient from 'openapi-fetch';

import type { paths } from './schema';
import { secureTokenStore } from './secure-token-store';
import { createSession } from './session';

/** Set per build in `.env.development` / `.env.production`. Unset means no account features. */
const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const isApiConfigured = Boolean(baseUrl);

export const session = createSession({
  client: createClient<paths>({ baseUrl }),
  store: secureTokenStore,
});

/** Authenticated client for every endpoint outside `/v1/auth`. */
export const api = createClient<paths>({ baseUrl });
api.use(session.middleware);
