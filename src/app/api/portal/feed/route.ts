import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: reflexiones compartidas anónimamente que aún no tienen un insight.
// No se expone user_id al cliente en ningún momento (mantiene el anonimato).
export async function GET() {
  try {
    const [checkins] = await pool.execute<RowDataPacket[]>(
      `SELECT c.checkin_id, e.name AS emotion, c.note, c.created_at
       FROM checkins c
       JOIN emotions e ON e.emotion_id = c.emotion_id
       WHERE c.shared_anonymously = 1
         AND c.checkin_id NOT IN (SELECT checkin_id FROM insights)
       ORDER BY c.created_at DESC`,
    );
    const [tags] = await pool.execute<RowDataPacket[]>(
      `SELECT tag_id, name FROM insight_tags ORDER BY name`,
    );
    return NextResponse.json({ checkins, tags });
  } catch (error) {
    console.error("Feed GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST: el profesional envía su insight para una reflexión específica.
export async function POST(request: Request) {
  try {
    const { checkinId, professionalId, tagId, content } = await request.json();
    if (!checkinId || !professionalId || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO insights (checkin_id, professional_id, tag_id, content)
       VALUES (?, ?, ?, ?)`,
      [checkinId, professionalId, tagId ?? null, content],
    );
    return NextResponse.json({ insightId: result.insertId });
  } catch (error) {
    console.error("Feed POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
