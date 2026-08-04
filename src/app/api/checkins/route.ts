import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const [rows] = await db.query(
      `SELECT c.checkin_id, c.note, c.shared_anonymously, c.created_at,
              e.name AS emotion
       FROM checkins c
       JOIN emotions e ON c.emotion_id = e.emotion_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId],
    );
    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch checkins" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emotionName, note, sharedAnonymously, influences } = body;

    const [emotionRows] = await db.query<RowDataPacket[]>(
      "SELECT emotion_id FROM emotions WHERE name = ?",
      [emotionName],
    );
    if (!emotionRows.length) {
      return NextResponse.json({ error: "Invalid emotion" }, { status: 400 });
    }
    const emotionId = emotionRows[0].emotion_id;

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO checkins (user_id, emotion_id, note, shared_anonymously)
       VALUES (?, ?, ?, ?)`,
      [userId, emotionId, note || null, sharedAnonymously || false],
    );
    const checkinId = result.insertId;

    if (influences && influences.length > 0) {
      for (const influenceName of influences) {
        const [infRows] = await db.query<RowDataPacket[]>(
          "SELECT influence_id FROM influences WHERE name = ?",
          [influenceName],
        );
        if (infRows.length) {
          await db.query(
            "INSERT INTO checkin_influences (checkin_id, influence_id) VALUES (?, ?)",
            [checkinId, infRows[0].influence_id],
          );
        }
      }
    }

    return NextResponse.json({ checkinId }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create checkin" },
      { status: 500 },
    );
  }
}
