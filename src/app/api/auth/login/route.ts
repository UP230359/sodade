import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password_hash } = body;

    if (!email || !password_hash) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id, name, email, password_hash as stored_hash FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0 || users[0].stored_hash !== password_hash) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        user: { id: users[0].id, name: users[0].name, email: users[0].email },
        token: "sodade-dummy-token",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in auth/login:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
