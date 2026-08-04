import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface CheckinRow extends RowDataPacket {
    checkin_id: number;
    user_id: number;
    note: string | null;
    emotion_id: number;
    created_at: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const emotionId = searchParams.get('emotion_id');
        const sort = searchParams.get('sort') || 'DESC';

        let query = `
            SELECT 
                checkin_id as id,
                user_id,
                note as content,
                emotion_id as category,
                created_at as timestamp,
                'pending' as status,
                NULL as draft_recommendation,
                NULL as tag,
                checkin_id
            FROM checkins
            WHERE 1=1
        `;
        const params: (string | number)[] = [];
        if (emotionId && emotionId !== 'all') {
            query += ` AND emotion_id = ?`;
            params.push(parseInt(emotionId));
        }
        query += ` ORDER BY created_at ${sort}`;

        const [rows] = await pool.query<CheckinRow[]>(query, params);
        const formatted = rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            content: row.content || '',
            category: row.category,
            timestamp: row.timestamp,
            status: 'pending',
            draft_recommendation: null,
            tag: null,
            checkin_id: row.checkin_id,
        }));
        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching checkins:', error);
        return NextResponse.json(
            { error: 'Failed to fetch checkins' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body; // eliminamos 'draft_recommendation' porque no se usa
        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }
        return NextResponse.json({
            success: true,
            message: 'Reflection updated (simulated)',
        });
    } catch (error) {
        console.error('Error updating reflection:', error);
        return NextResponse.json(
            { error: 'Failed to update reflection' },
            { status: 500 }
        );
    }
}