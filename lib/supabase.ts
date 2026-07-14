import { createClient } from "@supabase/supabase-js";

export const AUTH_COOKIE_NAME = "northstar-auth";

export interface SupabaseUser {
  id: string;
  email: string;
  role: string;
}

export interface SupabaseSession {
  accessToken: string;
  user: SupabaseUser;
}

export interface SupabaseAuthClient {
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ error?: { message: string }; session?: SupabaseSession }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<SupabaseSession | null>;
}

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url.includes("placeholder")) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function createSupabaseBrowserClient(): Promise<SupabaseAuthClient> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      async signInWithPassword() {
        return { error: { message: "Supabase is not configured yet." } };
      },
      async signOut() {
        return undefined;
      },
      async getSession() {
        return null;
      },
    };
  }

  return {
    async signInWithPassword({ email, password }) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return { error: { message: error?.message ?? "Unable to sign in" } };
      }

      return {
        session: {
          accessToken: data.session.access_token,
          user: {
            id: data.user?.id ?? "",
            email: data.user?.email ?? email,
            role: data.user?.role ?? "HR Manager",
          },
        },
      };
    },
    async signOut() {
      await client.auth.signOut();
    },
    async getSession() {
      const { data } = await client.auth.getSession();
      if (!data.session) {
        return null;
      }

      return {
        accessToken: data.session.access_token,
        user: {
          id: data.user?.id ?? "",
          email: data.user?.email ?? "",
          role: data.user?.role ?? "HR Manager",
        },
      };
    },
  };
}

export async function createSupabaseServerClient() {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return client;
}
