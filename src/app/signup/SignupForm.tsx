"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/learn`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Almost there!</h1>
          <p className="text-[#8b949e]">
            We sent a confirmation email to <strong className="text-[#e6edf3]">{email}</strong>.
            Click the link to activate your account and begin your journey.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex no-underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
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
          <p className="text-[#8b949e] text-sm mt-2">Create your free account</p>
        </div>

        <div className="cosmic-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-sm">{error}</div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8b949e] mb-1.5">Your name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="Galileo Galilei" />
            </div>
            <div>
              <label className="block text-sm text-[#8b949e] mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-[#8b949e] mb-1.5">Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="8+ characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-[#8b949e] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#58a6ff] no-underline hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
