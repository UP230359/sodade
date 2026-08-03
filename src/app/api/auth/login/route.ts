import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Endpoint POST /api/auth/login
// Valida el email y password directamente contra la tabla users de MySQL.
// No usa cookies ni tokens: solo confirma si las credenciales son correctas
// y devuelve los datos del usuario para que el frontend los guarde en Redux.
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
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];

    // Comparación directa de contraseñas en texto plano, sin hash
    if (user.password_hash !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Credenciales correctas: se devuelve el usuario al frontend
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