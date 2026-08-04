import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password_hash } = body;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = rows[0];
        // Aquí iría la comparación de contraseña (bcrypt)
        if (user.password_hash !== password_hash) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
            },
            token: 'fake-jwt-token',
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}