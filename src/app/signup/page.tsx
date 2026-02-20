import { Suspense } from "react";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-[#8b949e]">Loading…</span></div>}>
      <SignupForm />
    </Suspense>
  );
}
