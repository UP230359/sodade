// src/app/api/journal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface JournalEntry extends RowDataPacket {
    entry_id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

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
        const [rows] = await pool.query<JournalEntry[]>(
            'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entries' },
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
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO journal_entries (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [user_id, title || 'Untitled', content]
        );
        const [newEntry] = await pool.query<JournalEntry[]>(
            'SELECT * FROM journal_entries WHERE entry_id = ?',
            [result.insertId]
        );
        return NextResponse.json({
            success: true,
            entry: newEntry[0],
            entry_id: result.insertId,
        });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to create journal entry' },
            { status: 500 }
        );
    }
}