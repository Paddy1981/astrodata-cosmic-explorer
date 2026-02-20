import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { lessonId } = body;
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  // Fetch lesson XP
  const { data: lesson } = await supabase
    .from("lessons")
    .select("xp_reward")
    .eq("id", lessonId)
    .single();

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const xpReward = lesson.xp_reward ?? 50;

  // Check if already completed
  const { data: existing } = await supabase
    .from("user_progress")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing?.status === "completed") {
    return NextResponse.json({ alreadyDone: true, xpEarned: 0 });
  }

  // Upsert progress row
  let progressError: string | null = null;
  if (existing) {
    const { error } = await supabase
      .from("user_progress")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        xp_earned: xpReward,
      })
      .eq("id", existing.id);
    if (error) progressError = error.message;
  } else {
    const { error } = await supabase.from("user_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
      xp_earned: xpReward,
    });
    if (error) progressError = error.message;
  }

  if (progressError) {
    // Don't block the user — still update XP even if progress row fails
    console.error("user_progress error:", progressError);
  }

  // Update profile XP + level
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", user.id)
    .single();

  const newXp = (profile?.xp ?? 0) + xpReward;
  const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

  await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("id", user.id);

  // Also update streak — mark today as active
  await supabase
    .from("streaks")
    .upsert(
      { user_id: user.id, last_active_date: new Date().toISOString().slice(0, 10) },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ alreadyDone: false, xpEarned: xpReward, newTotal: newXp, newLevel });
}
