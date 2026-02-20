import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">403 — Forbidden</h1>
          <p className="text-[#8b949e]">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <header className="border-b border-[#30363d] bg-[#161b22] px-6 py-3 flex items-center gap-4">
        <span className="font-bold text-[#e6edf3]">AstroData Admin</span>
        <span className="text-[#8b949e] text-sm">Logged in as {user.email}</span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
