// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password_hash } = body;

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (first_name, last_name, email, password_hash, account_type) VALUES (?, ?, ?, ?, ?)',
            [name, '', email, password_hash, 'user']
        );

        return NextResponse.json({
            user: { id: result.insertId, name, email },
            token: 'fake-jwt-token',
        });
    } catch (_error) {
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}