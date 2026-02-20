"use client";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LearnLogout() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5">
      Sign out
    </button>
  );
}
