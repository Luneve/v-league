import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine redirect based on user role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role;
        if (role === "organization") {
          return NextResponse.redirect(`${origin}/org/dashboard`);
        } else if (role === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  // If there's no code or an error, redirect to login with an error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
