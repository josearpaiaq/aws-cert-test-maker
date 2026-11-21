import createClient from 'openapi-fetch';

import type { paths } from '../schema';
import { ApiError, createSession, type TokenStore } from '../session';

type Handler = (path: string, body: unknown) => { status: number; body?: unknown };

function setup(handler: Handler, initialRefreshToken: string | null = null) {
  let stored = initialRefreshToken;
  const store: TokenStore = {
    get: async () => stored,
    set: async (token) => {
      stored = token;
    },
    clear: async () => {
      stored = null;
    },
  };
  const calls: { path: string; auth: string | null }[] = [];
  const fetch = async (request: Request) => {
    const path = new URL(request.url).pathname;
    const text = await request.text();
    calls.push({ path, auth: request.headers.get('Authorization') });
    const res = handler(path, text ? JSON.parse(text) : undefined);
    return new Response(res.body === undefined ? null : JSON.stringify(res.body), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  let clock = 0;
  const session = createSession({
    client: createClient<paths>({ baseUrl: 'http://api.test', fetch }),
    store,
    now: () => clock,
  });
  const api = createClient<paths>({ baseUrl: 'http://api.test', fetch });
  api.use(session.middleware);
  return {
    session,
    api,
    calls,
    stored: () => stored,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

const tokens = (n: number) => ({
  tokenType: 'Bearer',
  accessToken: `access-${n}`,
  expiresIn: 900,
  refreshToken: `refresh-${n}`,
});

const me = { id: 'u1', email: 'ada@example.com', displayName: null, createdAt: '' };

describe('createSession', () => {
  it('signs in, stores the refresh token and authenticates requests', async () => {
    const t = setup((path) =>
      path === '/v1/auth/login' ? { status: 200, body: tokens(1) } : { status: 200, body: me },
    );
    await t.session.signIn('login', { email: 'ada@example.com', password: 'password123' });
    expect(t.stored()).toBe('refresh-1');

    await t.api.GET('/v1/me');
    expect(t.calls.at(-1)).toEqual({ path: '/v1/me', auth: 'Bearer access-1' });
  });

  it('throws ApiError with the status when sign-in fails', async () => {
    const t = setup(() => ({ status: 401 }));
    await expect(t.session.signIn('login', { email: 'a@b.co', password: 'x' })).rejects.toEqual(
      new ApiError(401),
    );
    expect(t.stored()).toBeNull();
  });

  it('refreshes once for concurrent requests after the access token expires', async () => {
    let issued = 1;
    const t = setup((path) => {
      if (path === '/v1/auth/login') return { status: 200, body: tokens(1) };
      if (path === '/v1/auth/refresh') return { status: 200, body: tokens(++issued) };
      return { status: 200, body: me };
    });
    await t.session.signIn('login', { email: 'a@b.co', password: 'password123' });
    t.advance(900_000);

    await Promise.all([t.api.GET('/v1/me'), t.api.GET('/v1/me'), t.api.GET('/v1/me')]);

    expect(t.calls.filter((c) => c.path === '/v1/auth/refresh')).toHaveLength(1);
    expect(t.calls.filter((c) => c.path === '/v1/me').map((c) => c.auth)).toEqual([
      'Bearer access-2',
      'Bearer access-2',
      'Bearer access-2',
    ]);
    expect(t.stored()).toBe('refresh-2');
  });

  it('restores from a stored refresh token after a restart', async () => {
    const t = setup(
      (path) =>
        path === '/v1/auth/refresh' ? { status: 200, body: tokens(5) } : { status: 200, body: me },
      'refresh-4',
    );
    await expect(t.session.hasSession()).resolves.toBe(true);
    await t.api.GET('/v1/me');
    expect(t.calls.map((c) => c.path)).toEqual(['/v1/auth/refresh', '/v1/me']);
    expect(t.stored()).toBe('refresh-5');
  });

  it('ends the session when the refresh token is rejected', async () => {
    const t = setup(
      (path) => (path === '/v1/auth/refresh' ? { status: 401 } : { status: 401 }),
      'revoked',
    );
    await expect(t.session.accessToken()).resolves.toBeNull();
    await expect(t.session.hasSession()).resolves.toBe(false);
  });

  it('keeps the session when the server fails for other reasons', async () => {
    const t = setup(() => ({ status: 503 }), 'refresh-1');
    await expect(t.session.accessToken()).rejects.toEqual(new ApiError(503));
    expect(t.stored()).toBe('refresh-1');
  });

  it('refreshes before the next request after a 401', async () => {
    let issued = 1;
    let meStatus = 401;
    const t = setup((path) => {
      if (path === '/v1/auth/login') return { status: 200, body: tokens(1) };
      if (path === '/v1/auth/refresh') return { status: 200, body: tokens(++issued) };
      const status = meStatus;
      meStatus = 200;
      return { status, body: status === 200 ? me : undefined };
    });
    await t.session.signIn('login', { email: 'a@b.co', password: 'password123' });
    await t.api.GET('/v1/me');
    await t.api.GET('/v1/me');
    expect(t.calls.map((c) => c.path)).toEqual([
      '/v1/auth/login',
      '/v1/me',
      '/v1/auth/refresh',
      '/v1/me',
    ]);
  });

  it('signs out locally even when the server is unreachable', async () => {
    const t = setup(() => {
      throw new TypeError('Network request failed');
    }, 'refresh-1');
    await t.session.signOut();
    expect(t.stored()).toBeNull();
  });
});
