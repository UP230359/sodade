// src/app/api/journal/[entry_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        const { entry_id } = await params;
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entry' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        const { entry_id } = await params;
        const body = await request.json();
        const { title, content } = body;

        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT entry_id FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        const updates: string[] = [];
        const values: (string | number)[] = [];
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (content !== undefined) {
            updates.push('content = ?');
            values.push(content);
        }
        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }
        values.push(entry_id);
        await pool.query<ResultSetHeader>(
            `UPDATE journal_entries SET ${updates.join(', ')} WHERE entry_id = ?`,
            values
        );

        const [updated] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        return NextResponse.json({ success: true, entry: updated[0] });
    } catch (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json(
            { error: 'Failed to update entry' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        const { entry_id } = await params;
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT entry_id FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        if (existing.length === 0) {
            return NextResponse.json(
                { error: `Entry ${entry_id} not found` },
                { status: 404 }
            );
        }
        await pool.query<ResultSetHeader>(
            'DELETE FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete entry' },
            { status: 500 }
        );
    }
}