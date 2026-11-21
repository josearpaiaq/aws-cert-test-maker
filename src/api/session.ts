import type { Client, Middleware } from 'openapi-fetch';

import type { paths } from './schema';
import type { Credentials, TokenResponse } from './types';

/** Where the refresh token lives between launches. */
export type TokenStore = {
  get: () => Promise<string | null>;
  set: (token: string) => Promise<void>;
  clear: () => Promise<void>;
};

/** A non-2xx answer from the API. Network failures surface as the fetch TypeError instead. */
export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API responded with ${status}`);
  }
}

/** Refresh this long before the access token expires, to absorb latency. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * Holds the tokens for one signed-in account. The access token is kept in memory only; the
 * refresh token goes to `store`. Refreshes are single-flight: the API treats a reused refresh
 * token as stolen and signs the device out, so two concurrent refreshes must never happen.
 *
 * `client` must be a client without `middleware` attached, used for the auth endpoints.
 */
export function createSession(options: {
  client: Client<paths>;
  store: TokenStore;
  now?: () => number;
}) {
  const { client, store, now = Date.now } = options;
  let access: { token: string; expiresAt: number } | null = null;
  let refreshing: Promise<string | null> | null = null;

  const save = async (tokens: TokenResponse) => {
    access = { token: tokens.accessToken, expiresAt: now() + tokens.expiresIn * 1000 };
    await store.set(tokens.refreshToken);
  };

  const clear = async () => {
    access = null;
    await store.clear();
  };

  /** Resolves to a fresh access token, or null when the session is gone (signed out). */
  const refresh = (): Promise<string | null> => {
    refreshing ??= (async () => {
      const refreshToken = await store.get();
      if (!refreshToken) return null;
      const { data, response } = await client.POST('/v1/auth/refresh', {
        body: { refreshToken },
      });
      if (data) {
        await save(data);
        return data.accessToken;
      }
      if (response.status === 401) {
        await clear();
        return null;
      }
      throw new ApiError(response.status);
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  const accessToken = async (): Promise<string | null> =>
    access && access.expiresAt - EXPIRY_MARGIN_MS > now() ? access.token : refresh();

  /** Adds the bearer token to every request of the client it is attached to. */
  const middleware: Middleware = {
    async onRequest({ request }) {
      const token = await accessToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
    onResponse({ response }) {
      // Revoked or expired early: the next request refreshes first.
      if (response.status === 401) access = null;
      return undefined;
    },
  };

  return {
    middleware,
    accessToken,
    hasSession: async () => (await store.get()) !== null,

    async signIn(mode: 'login' | 'register', credentials: Credentials) {
      const path = mode === 'login' ? '/v1/auth/login' : '/v1/auth/register';
      const { data, response } = await client.POST(path, { body: credentials });
      if (!data) throw new ApiError(response.status);
      await save(data);
    },

    /** Forgets the tokens locally first, so signing out works offline too. */
    async signOut() {
      const refreshToken = await store.get();
      await clear();
      if (refreshToken) {
        await client.POST('/v1/auth/logout', { body: { refreshToken } }).catch(() => undefined);
      }
    },

    /** Call after the account was deleted on the server. */
    forget: clear,
  };
}

export type Session = ReturnType<typeof createSession>;
