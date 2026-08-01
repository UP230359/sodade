// src/app/api/portal/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ResponseRow extends RowDataPacket {
    id: number;
    reflection_id: number;
    user_id: string;
    reflection_text: string;
    insight_text: string;
    category: string;
    response_date: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const professionalId = searchParams.get('professional_id');

        let query = `
            SELECT 
                id,
                reflection_id,
                user_id,
                reflection_text,
                insight_text,
                category,
                response_date
            FROM psychologist_responses
            WHERE 1=1
        `;
        const params: (string | number)[] = [];
        if (professionalId) {
            query += ` AND professional_id = ?`;
            params.push(parseInt(professionalId));
        }
        query += ` ORDER BY response_date DESC`;

        const [rows] = await pool.query<ResponseRow[]>(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch responses' },
            { status: 500 }
        );
    }
}