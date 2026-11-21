import { accountErrorMessage } from '../error-message';
import { ApiError } from '../session';

describe('accountErrorMessage', () => {
  it('explains network failures', () => {
    expect(accountErrorMessage(new TypeError('Network request failed'), 'login')).toMatch(
      /connection/,
    );
  });

  it.each([
    [400, 'login', /at least 8/],
    [401, 'login', /Wrong email or password/],
    [409, 'register', /already exists/],
    [429, 'login', /Too many attempts/],
    [500, 'login', /Try again later/],
  ] as const)('maps %i (%s)', (status, mode, expected) => {
    expect(accountErrorMessage(new ApiError(status), mode)).toMatch(expected);
  });
});
