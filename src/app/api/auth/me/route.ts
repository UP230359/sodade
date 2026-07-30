import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET() {
    const session = await getAuthUser();
    if (!session) return NextResponse.json({ user: null });

    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT user_id, first_name, last_name, email, account_type
     FROM users WHERE user_id = ?`,
        [session.userId],
    );
    if (rows.length === 0) return NextResponse.json({ user: null });

    const user = rows[0];
    return NextResponse.json({
        user: {
            id: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            accountType: user.account_type,
        },
    });
}