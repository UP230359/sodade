import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password_hash } = body;

    if (!name || !email || !password_hash) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const [existingUsers] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash],
    );

    return NextResponse.json(
      {
        user: { id: result.insertId, name, email },
        token: "sodade-dummy-token",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
