"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthResponse } from "@supabase/supabase-js";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/learn";
    const oauthError = searchParams.get("error");

    if (oauthError) {
      router.replace(`/login?error=${encodeURIComponent(oauthError)}`);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then((result: AuthResponse) => {
        if (result.error) {
          router.replace(`/login?error=${encodeURIComponent(result.error.message)}`);
        } else {
          router.replace(next);
        }
      });
    } else {
      supabase.auth.getSession().then((res: { data: { session: unknown } }) => {
        if (res.data.session) {
          router.replace(next);
        } else {
          router.replace("/login?error=no_code");
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#8b949e] text-sm">Completing sign in…</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8b949e] text-sm">Completing sign in…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
