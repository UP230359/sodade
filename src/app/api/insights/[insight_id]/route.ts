// src/app/api/insights/[insight_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ insight_id: string }> }
) {
    try {
        const { insight_id } = await params;
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT insight_id FROM insights WHERE insight_id = ?',
            [insight_id]
        );

        if (existing.length === 0) {
            return NextResponse.json(
                { error: `Insight ${insight_id} not found` },
                { status: 404 }
            );
        }

        await pool.query<ResultSetHeader>(
            'DELETE FROM insights WHERE insight_id = ?',
            [insight_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting insight:', error);
        return NextResponse.json(
            { error: 'Failed to delete insight', details: String(error) },
            { status: 500 }
        );
    }
}