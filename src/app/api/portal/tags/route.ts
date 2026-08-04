import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface TagRow extends RowDataPacket {
    tag_id: number;
    name: string;
}

export async function GET() {
    try {
        const [rows] = await pool.query<TagRow[]>(
            'SELECT tag_id, name FROM insight_tags ORDER BY name'
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}