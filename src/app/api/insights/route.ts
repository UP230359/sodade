import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface InsightRow extends RowDataPacket {
  insight_id: number;
  checkin_id: number;
  professional_id: number;
  tag_id: number | null;
  content: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id");
    const professionalId = searchParams.get("professional_id");

    let query = `
            SELECT 
                i.insight_id,
                i.checkin_id,
                i.professional_id,
                i.tag_id,
                i.content,
                i.created_at,
                u.first_name,
                u.last_name
            FROM insights i
            LEFT JOIN users u ON i.professional_id = u.user_id
            WHERE 1=1
        `;
    const params: (string | number)[] = [];

    if (userId) {
      query += ` AND i.checkin_id IN (SELECT checkin_id FROM checkins WHERE user_id = ?)`;
      params.push(parseInt(userId));
    }
    if (professionalId) {
      query += ` AND i.professional_id = ?`;
      params.push(parseInt(professionalId));
    }
    query += ` ORDER BY i.created_at DESC`;

    const [rows] = await pool.query<InsightRow[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch insights", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkin_id, professional_id, content } = body;

    if (!checkin_id || !professional_id || !content) {
      return NextResponse.json(
        { error: "checkin_id, professional_id, and content are required" },
        { status: 400 },
      );
    }

    const [checkinExists] = await pool.query<RowDataPacket[]>(
      "SELECT checkin_id FROM checkins WHERE checkin_id = ?",
      [checkin_id],
    );
    if (checkinExists.length === 0) {
      return NextResponse.json(
        { error: `Checkin ${checkin_id} not found` },
        { status: 404 },
      );
    }

    const [professionalExists] = await pool.query<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE user_id = ?",
      [professional_id],
    );
    if (professionalExists.length === 0) {
      return NextResponse.json(
        { error: `Professional ${professional_id} not found` },
        { status: 404 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO insights (checkin_id, professional_id, content, created_at)
             VALUES (?, ?, ?, NOW())`,
      [checkin_id, professional_id, content],
    );

    const [newInsight] = await pool.query<InsightRow[]>(
      `SELECT 
                i.insight_id,
                i.checkin_id,
                i.professional_id,
                i.content,
                i.created_at,
                u.first_name,
                u.last_name
            FROM insights i
            LEFT JOIN users u ON i.professional_id = u.user_id
            WHERE i.insight_id = ?`,
      [result.insertId],
    );

    return NextResponse.json({
      success: true,
      insight: newInsight[0],
      insight_id: result.insertId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create insight", details: String(error) },
      { status: 500 },
    );
  }
}
