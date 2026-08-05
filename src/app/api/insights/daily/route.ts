import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        reflection:
          "Every emotion is a messenger, not a residence. Take a moment to breathe and observe your inner landscape today.",
      });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT emotion, note, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId],
    );

    if (rows.length === 0) {
      return NextResponse.json({
        reflection:
          "Welcome to your emotional journey. Start your first check-in today to unlock personalized daily reflections.",
      });
    }

    const latestEmotion = rows[0].emotion;
    const reflectionsMap: Record<string, string> = {
      Joy: `Your recent moments of joy highlight a wonderful alignment in your day. Notice what fostered this lightness and let it anchor you.`,
      Calm: `You have cultivated a deep sense of peace recently. Rest in this stillness; it is a powerful foundation for clarity.`,
      Sadness: `Carrying sadness takes courage. Remember that gentle acceptance of your heavy moments is the first step toward easing them.`,
      Anger: `Anger often points toward a boundary that needs attention or protection. Listen to its message with compassion rather than judgment.`,
      Fear: `Uncertainty can feel daunting, but you have navigated challenges before. Take things one breath at a time today.`,
      Disgust: `Noticing what feels misaligned helps you honor your values. Give yourself space to process what doesn't serve you.`,
      Surprise: `Unexpected twists can disrupt our equilibrium. Embrace the adaptability within you as you navigate today's shifts.`,
      Trust: `Trusting yourself and the process is a quiet strength. Lean into that inner certainty as you move forward.`,
    };

    const reflection =
      reflectionsMap[latestEmotion] ||
      `Your recent reflections show a rich emotional texture. Every feeling is a temporary visitor guiding you toward deeper self-awareness.`;

    return NextResponse.json({ reflection });
  } catch {
    return NextResponse.json({
      reflection: "Embrace each moment with patience and self-compassion.",
    });
  }
}
