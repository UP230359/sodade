// app/api/portal/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface InsightWithCheckin extends RowDataPacket {
    id: number;
    reflection_id: number;
    professional_id: number;
    user_id: number;
    reflection_text: string | null;
    insight_text: string;
    category: string;
    response_date: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const professionalId = searchParams.get('professional_id');

        // Validar que professional_id esté presente
        if (!professionalId) {
            return NextResponse.json(
                { error: 'professional_id is required' },
                { status: 400 }
            );
        }

        const query = `
            SELECT 
                i.insight_id AS id,
                i.checkin_id AS reflection_id,
                i.professional_id,
                c.user_id,
                c.note AS reflection_text,
                i.content AS insight_text,
                'GENERAL' AS category,
                i.created_at AS response_date
            FROM insights i
            LEFT JOIN checkins c ON i.checkin_id = c.checkin_id
            WHERE i.professional_id = ?
            ORDER BY i.created_at DESC
        `;

        const [rows] = await pool.query<InsightWithCheckin[]>(query, [parseInt(professionalId)]);

        // Formatear la respuesta para que coincida con lo que espera el frontend
        const formatted = rows.map(row => ({
            id: row.id,
            reflection_id: row.reflection_id,
            professional_id: row.professional_id,
            user_id: String(row.user_id || ''),
            reflection_text: row.reflection_text || '',
            insight_text: row.insight_text,
            category: row.category,
            response_date: row.response_date,
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch responses', details: String(error) },
            { status: 500 }
        );
    }
}