import { ApiError } from './session';

/** User-facing text for a failed sign-in or account request. */
export function accountErrorMessage(error: unknown, mode: 'login' | 'register'): string {
  if (!(error instanceof ApiError)) {
    return "Can't reach CloudPrep right now. Check your connection and try again.";
  }
  switch (error.status) {
    case 400:
      return 'Enter a valid email and a password of at least 8 characters.';
    case 401:
      return mode === 'login' ? 'Wrong email or password.' : 'Your session expired. Sign in again.';
    case 409:
      return 'An account with this email already exists. Sign in instead.';
    case 429:
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return 'Something went wrong on our side. Try again later.';
  }
}
