import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type SupabaseAdminConfig = {
  url: string;
  serviceRoleKey: string;
};

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseAdminConfig() !== null;
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getBrowserSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }

  return browserClient;
}

export function createAdminSupabaseClient(): SupabaseClient {
  const config = getSupabaseAdminConfig();

  if (!config) {
    throw new Error(
      "Supabase admin environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getAdminSupabaseClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createAdminSupabaseClient();
  }

  return adminClient;
}
