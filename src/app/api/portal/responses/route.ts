import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: historial de insights enviados por un profesional específico.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get("professionalId");
    if (!professionalId) {
      return NextResponse.json(
        { message: "Missing professionalId" },
        { status: 400 },
      );
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.insight_id, i.content, i.created_at,
              t.name AS tag_name,
              c.note AS checkin_note, c.created_at AS checkin_created_at,
              e.name AS checkin_emotion
       FROM insights i
       JOIN checkins c ON c.checkin_id = i.checkin_id
       JOIN emotions e ON e.emotion_id = c.emotion_id
       LEFT JOIN insight_tags t ON t.tag_id = i.tag_id
       WHERE i.professional_id = ?
       ORDER BY i.created_at DESC`,
      [professionalId],
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Responses GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
