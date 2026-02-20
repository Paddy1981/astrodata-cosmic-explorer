import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-[#8b949e]">Loading…</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
