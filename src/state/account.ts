import { create } from 'zustand';

import { api, isApiConfigured, session } from '@/api/client';
import { ApiError } from '@/api/session';
import type { Credentials, Me } from '@/api/types';

type AccountState = {
  /** `unknown` until `restore` has checked for a stored session. */
  status: 'unknown' | 'signed-out' | 'signed-in';
  /** Null while signed out, or signed in but the profile could not be loaded (offline). */
  user: Me | null;

  restore: () => Promise<void>;
  signIn: (mode: 'login' | 'register', credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

/**
 * The CloudPrep account this device is connected to. Optional: everything else in the app works
 * the same while signed out.
 */
export const useAccount = create<AccountState>((set) => {
  const loadUser = async () => {
    const { data, response } = await api.GET('/v1/me');
    if (data) {
      set({ status: 'signed-in', user: data });
    } else if (response.status === 401 && !(await session.hasSession())) {
      set({ status: 'signed-out', user: null });
    }
  };

  return {
    status: 'unknown',
    user: null,

    async restore() {
      if (!isApiConfigured || !(await session.hasSession())) {
        set({ status: 'signed-out' });
        return;
      }
      // Signed in as far as this device knows, even offline; the profile loads when it can.
      set({ status: 'signed-in' });
      await loadUser().catch(() => undefined);
    },

    async signIn(mode, credentials) {
      await session.signIn(mode, credentials);
      set({ status: 'signed-in' });
      await loadUser().catch(() => undefined);
    },

    async signOut() {
      await session.signOut();
      set({ status: 'signed-out', user: null });
    },

    async deleteAccount() {
      const { response } = await api.DELETE('/v1/me');
      if (!response.ok) throw new ApiError(response.status);
      await session.forget();
      set({ status: 'signed-out', user: null });
    },
  };
});
