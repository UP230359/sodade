import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id, professional_cedula, institution_name, primary_specialty,
              verification_status, verification_date
       FROM professional_profiles WHERE user_id = ?`,
      [userId],
    );
    return NextResponse.json({ profile: rows[0] ?? null });
  } catch (error) {
    console.error("Verify GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST: crea o actualiza el perfil profesional. Sin panel de admin,
// se activa automáticamente al enviar la cédula (ver nota en el chat).
export async function POST(request: Request) {
  try {
    const { userId, cedula, institutionName, primarySpecialty } =
      await request.json();
    if (!userId || !cedula) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const status = "active";
    const verificationDate = new Date().toISOString().slice(0, 10);

    await pool.execute(
      `INSERT INTO professional_profiles
         (user_id, professional_cedula, institution_name, primary_specialty, verification_status, verification_date)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         professional_cedula = VALUES(professional_cedula),
         institution_name = VALUES(institution_name),
         primary_specialty = VALUES(primary_specialty),
         verification_status = VALUES(verification_status),
         verification_date = VALUES(verification_date)`,
      [
        userId,
        cedula,
        institutionName ?? null,
        primarySpecialty ?? null,
        status,
        verificationDate,
      ],
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id, professional_cedula, institution_name, primary_specialty,
              verification_status, verification_date
       FROM professional_profiles WHERE user_id = ?`,
      [userId],
    );
    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error("Verify POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
