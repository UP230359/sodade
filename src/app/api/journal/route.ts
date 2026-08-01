// app/api/journal/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        const [rows] = await pool.query(
            `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching journal:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, title, content } = body;

        if (!user_id || !content) {
            return NextResponse.json(
                { error: 'user_id and content are required' },
                { status: 400 }
            );
        }

        const [result] = await pool.query(
            `INSERT INTO journal_entries (user_id, title, content, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())`,
            [user_id, title || 'Untitled', content]
        );

        return NextResponse.json({
            success: true,
            entry_id: (result as any).insertId
        });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to create journal entry' },
            { status: 500 }
        );
    }
}