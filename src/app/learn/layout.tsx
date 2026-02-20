import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import LearnLogout from "./LearnLogout";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/learn");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name, xp, level")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ??
    profile?.full_name ??
    user.email?.split("@")[0] ??
    "Explorer";

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md">
        <div className="content-container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="no-underline">
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: "linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  AstroData
                </span>
              </Link>
              <span className="text-[#30363d]">/</span>
              <Link href="/learn" className="text-sm text-[#58a6ff] no-underline hover:underline">
                Learn
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {profile && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="badge badge-purple">Lv.{profile.level ?? 1}</span>
                  <span className="text-xs text-[#8b949e]">{profile.xp ?? 0} XP</span>
                </div>
              )}
              <span className="text-sm text-[#c9d1d9]">{displayName}</span>
              <LearnLogout />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
