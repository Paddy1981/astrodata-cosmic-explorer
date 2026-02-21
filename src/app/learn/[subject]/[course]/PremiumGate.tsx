"use client";

import Link from "next/link";

interface Props {
  courseTitle: string;
  color: string;
}

export default function PremiumGate({ courseTitle, color }: Props) {
  return (
    <div
      className="mt-8 rounded-2xl border p-8 text-center"
      style={{ background: `${color}0d`, borderColor: `${color}30` }}
    >
      <div className="text-4xl mb-3">🔒</div>
      <h3 className="text-xl font-bold text-[#e6edf3] mb-2">Premium Course</h3>
      <p className="text-[#8b949e] text-sm mb-6 max-w-md mx-auto">
        <strong className="text-[#c9d1d9]">{courseTitle}</strong> is part of the Premium library.
        Upgrade to unlock all 12 courses, unlimited enrolments, and your full learning history.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/learn/upgrade"
          className="btn-primary no-underline text-base px-8 py-3"
          style={{ background: color, borderColor: color } as React.CSSProperties}
        >
          Upgrade to Premium →
        </Link>
        <Link href="/learn" className="text-sm text-[#8b949e] hover:text-[#c9d1d9] no-underline">
          Back to free courses
        </Link>
      </div>
      <p className="text-xs text-[#484f58] mt-4">
        Already premium? Make sure you&apos;re signed in with your account.
      </p>
    </div>
  );
}
