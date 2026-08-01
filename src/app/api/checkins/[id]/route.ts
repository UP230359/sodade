import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM checkins WHERE checkin_id = ?",
      [id],
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error in checkins GET:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM checkins WHERE checkin_id = ?",
      [id],
    );
    return NextResponse.json({ success: true, deleted: result.affectedRows });
  } catch (error) {
    console.error('Error in checkins DELETE:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
