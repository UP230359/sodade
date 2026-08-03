import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Endpoint POST /api/auth/register
// Crea una cuenta nueva en MySQL y devuelve al usuario con la misma forma
// que /api/auth/login ({ user: {...} }), para que el frontend lo pueda
// guardar en Redux de la misma manera en ambos flujos.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, accountType } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    // Solo aceptamos "personal" o "professional"; cualquier otro valor
    // (o ausencia de valor) cae por default en cuenta personal.
    const normalizedAccountType =
      accountType === "professional" ? "professional" : "personal";

    // Nota: igual que en login, la contraseña se guarda en texto plano por
    // ahora (sin hash). Contraseña en texto plano, sin hash, replicando el
    // mismo comportamiento simplificado que ya usa el endpoint de login.
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, email, password_hash, account_type)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, password, normalizedAccountType],
    );

    return NextResponse.json(
      {
        user: {
          id: result.insertId,
          firstName,
          lastName,
          email,
          accountType: normalizedAccountType,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
