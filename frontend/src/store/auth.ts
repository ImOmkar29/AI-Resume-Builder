import { create } from 'zustand';
import { getSupabase } from '../lib/supabaseClient';

type UserSession = {
  id: string;
  email: string | null;
};

type AuthState = {
  user: UserSession | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  init: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  async init() {
    let supabase;
    try { supabase = getSupabase(); } catch { set({ loading: false }); return; }
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    set({
      user: session ? { id: session.user.id, email: session.user.email } : null,
      loading: false,
    });
    supabase.auth.onAuthStateChange((_event, sessionNow) => {
      set({ user: sessionNow ? { id: sessionNow.user.id, email: sessionNow.user.email } : null });
    });
  },
  async signInWithGoogle() {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },
  async signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  },
  async signInWithEmail(email, password) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUpWithEmail(email, password) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },
}));


