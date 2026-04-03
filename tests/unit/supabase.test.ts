import { describe, expect, it, vi } from "vitest";
import {
  createBrowserSupabaseClient,
  getSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/supabase";

describe("supabase client", () => {
  it("initializes without error when env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.signature",
    );

    const config = getSupabaseConfig();
    const client = createBrowserSupabaseClient();

    expect(isSupabaseConfigured()).toBe(true);
    expect(config).toEqual({
      url: "https://example.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.signature",
    });
    expect(client.auth).toBeDefined();

    vi.unstubAllEnvs();
  });
});
