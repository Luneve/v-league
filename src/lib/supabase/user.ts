import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Prevent accidental import from client components.
// React.cache() is server-only; importing this module in a "use client" file
// would bypass request scoping and leak data between users.
if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase/user.ts is a server-only module and must not be imported in client components."
  );
}

/**
 * Request-scoped cached Supabase client.
 * React.cache() ensures only one client is created per server request,
 * so layout + page share the same instance (and underlying cookie/session).
 */
export const getSupabaseClient = cache(async () => {
  return createClient();
});

/**
 * Request-scoped cached auth user.
 * Eliminates redundant auth.getUser() calls across middleware -> layout -> page.
 * The first call hits Supabase Auth; subsequent calls within the same request are free.
 */
export const getAuthUser = cache(async () => {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
