import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id, first_name, last_name, email, password_hash, account_type
       FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];

    // Comparación directa, sin hash (decisión del proyecto para esta entrega)
    if (user.password_hash !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await setAuthCookie({
      userId: user.user_id,
      email: user.email,
      accountType: user.account_type,
    });

    return NextResponse.json({
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        accountType: user.account_type,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}