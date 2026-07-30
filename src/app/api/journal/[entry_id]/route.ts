// app/api/journal/[entry_id]/route.ts
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        const { entry_id } = await params;
        
        const [rows] = await pool.query<JournalEntry[]>(
            `SELECT * FROM journal_entries WHERE entry_id = ?`,
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
        console.error('Error fetching journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entry' },
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
        const queryParams: (string | number)[] = [];

        if (title !== undefined) {
            updates.push('title = ?');
            queryParams.push(title);
        }

        if (content !== undefined) {
            updates.push('content = ?');
            queryParams.push(content);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        updates.push('updated_at = NOW()');
        queryParams.push(entry_id);
        const query = `UPDATE journal_entries SET ${updates.join(', ')} WHERE entry_id = ?`;
        await pool.query<ResultSetHeader>(query, queryParams);

        const [updatedEntry] = await pool.query<JournalEntry[]>(
            `SELECT * FROM journal_entries WHERE entry_id = ?`,
            [entry_id]
        );

        return NextResponse.json({ 
            success: true, 
            entry: updatedEntry[0]
        });
    } catch (error) {
        console.error('Error updating journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to update journal entry' },
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
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        await pool.query<ResultSetHeader>(
            'DELETE FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );
        
        return NextResponse.json({ 
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete journal entry' },
            { status: 500 }
        );
    }
}