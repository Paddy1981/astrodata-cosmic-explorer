"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/learn";
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const urlError = searchParams.get("error");
  const [error, setError] = useState(urlError ? decodeURIComponent(urlError) : "");
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"password" | "magic">("password");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${redirectTo}` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicSent(true);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    const origin = window.location.origin;
    const redirectUrl = `${origin}/auth/callback?next=${redirectTo}`;
    console.log("[Google OAuth] redirectTo:", redirectUrl);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    console.log("[Google OAuth] data:", data, "error:", error);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block no-underline">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AstroData Learn
            </span>
          </Link>
          <p className="text-[#8b949e] text-sm mt-2">Sign in to continue your cosmic journey</p>
        </div>

        <div className="cosmic-card p-8">
          <div className="tab-nav mb-6">
            <button className={`tab-btn ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>Password</button>
            <button className={`tab-btn ${tab === "magic" ? "active" : ""}`} onClick={() => setTab("magic")}>Magic Link</button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-sm">{error}</div>
          )}

          {tab === "password" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1.5">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {tab === "magic" && (
            <>
              {magicSent ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✉️</div>
                  <p className="text-[#e6edf3] font-medium mb-1">Check your inbox</p>
                  <p className="text-[#8b949e] text-sm">Magic link sent to {magicEmail}</p>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8b949e] mb-1.5">Email</label>
                    <input type="email" required value={magicEmail} onChange={e => setMagicEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                      placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                    {loading ? "Sending…" : "Send Magic Link"}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#30363d]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#1c2333] px-3 text-xs text-[#8b949e]">or</span></div>
          </div>

          <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#8b949e] mt-6">
            No account?{" "}
            <Link href="/signup" className="text-[#58a6ff] no-underline hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
