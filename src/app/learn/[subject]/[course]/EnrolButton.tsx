"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  courseId: string;
  firstLessonHref: string;
  isEnrolled: boolean;
}

export default function EnrolButton({ courseId, firstLessonHref, isEnrolled }: Props) {
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [loading, setLoading] = useState(false);

  async function handleEnrol() {
    setLoading(true);
    try {
      const res = await fetch("/api/learn/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setEnrolled(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <Link href={firstLessonHref} className="btn-primary no-underline text-base px-8 py-3">
        Continue Learning →
      </Link>
    );
  }

  return (
    <button
      onClick={handleEnrol}
      disabled={loading}
      className="btn-primary text-base px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Enrolling…" : "Enrol →"}
    </button>
  );
}
