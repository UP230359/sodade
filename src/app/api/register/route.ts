import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, accountType, cedula } = await request.json();

    // Check mandatory fields
    if (!firstName || !lastName || !email || !password || !accountType) {
      return NextResponse.json(
        { success: false, error: "Missing required registration fields" },
        { status: 400 }
      );
    }

    if (accountType === "professional" && !cedula) {
      return NextResponse.json(
        { success: false, error: "Cédula profesional is required for professional accounts" },
        { status: 400 }
      );
    }

    // 1. Hash password securely using built-in crypto (SHA-256 for simple database storage)
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    // Acquire a connection for transactional safety
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Check if user already exists
      const [existingUsers] = await connection.query<RowDataPacket[]>(
        "SELECT user_id FROM users WHERE email = ? LIMIT 1",
        [email]
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "An account with this email address already exists" },
          { status: 400 }
        );
      }

      // Insert user into `users` table
      const [userResult] = await connection.query<ResultSetHeader>(
        "INSERT INTO users (first_name, last_name, email, password_hash, account_type) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, passwordHash, accountType]
      );

      const userId = userResult.insertId;

      // If it is a professional account, insert profile into `professional_profiles`
      if (accountType === "professional") {
        // Check if professional_cedula already registered
        const [existingCedulas] = await connection.query<RowDataPacket[]>(
          "SELECT user_id FROM professional_profiles WHERE professional_cedula = ? LIMIT 1",
          [cedula]
        );

        if (existingCedulas.length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { success: false, error: "This professional credential (cédula) is already registered" },
            { status: 400 }
          );
        }

        await connection.query(
          "INSERT INTO professional_profiles (user_id, professional_cedula, verification_status) VALUES (?, ?, ?)",
          [userId, cedula, "active"]
        );
      }

      await connection.commit();

      // Return user data (excluding password_hash)
      // id se devuelve como number (no .toString()) para que coincida con el
      // User de "@/lib/api" que usa el resto de la app (mood checkins, etc.)
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          firstName,
          lastName,
          email,
          accountType,
          isOnboarded: false,
          cedula: accountType === "professional" ? cedula : undefined,
        },
      });

    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Database registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
