import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { courseId } = body;
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ enrolled: true, alreadyEnrolled: true });
  }

  const { error } = await supabase.from("course_enrollments").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error) {
    // Handle race-condition duplicate (unique constraint)
    if (error.code === "23505") {
      return NextResponse.json({ enrolled: true, alreadyEnrolled: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrolled: true, alreadyEnrolled: false });
}
