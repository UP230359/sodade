// app/api/portal/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface InsightRow extends RowDataPacket {
    insight_id: number;
    checkin_id: number;
    professional_id: number;
    tag_id: number | null;
    content: string;
    created_at: string;
    user_id: number;
    note: string | null;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const professionalId = searchParams.get('professional_id');

        let query = `
            SELECT 
                i.insight_id as id,
                i.checkin_id as reflection_id,
                i.professional_id,
                c.user_id,
                c.note as reflection_text,
                i.content as insight_text,
                'GENERAL' as category,
                i.created_at as response_date
            FROM insights i
            LEFT JOIN checkins c ON i.checkin_id = c.checkin_id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (professionalId) {
            query += ` AND i.professional_id = ?`;
            params.push(professionalId);
        }

        query += ` ORDER BY i.created_at DESC`;

        const [rows] = await pool.query<InsightRow[]>(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching insights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
            { status: 500 }
        );
    }
}