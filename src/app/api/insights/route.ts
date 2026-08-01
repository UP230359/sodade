// app/api/insights/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface InsightRow extends RowDataPacket {
    insight_id: number;
    checkin_id: number;
    professional_id: number;
    tag_id: number | null;
    content: string;
    created_at: string;
    first_name?: string;
    last_name?: string;
}

// GET - Obtener insights por usuario
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('user_id');
        const professionalId = searchParams.get('professional_id');

        console.log('🔵 GET /api/insights - userId:', userId, 'professionalId:', professionalId);

        let query = `
            SELECT 
                i.insight_id,
                i.checkin_id,
                i.professional_id,
                i.tag_id,
                i.content,
                i.created_at,
                u.first_name,
                u.last_name
            FROM insights i
            LEFT JOIN users u ON i.professional_id = u.user_id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (userId) {
            query += ` AND i.checkin_id IN (SELECT checkin_id FROM checkins WHERE user_id = ?)`;
            params.push(parseInt(userId));
        }

        if (professionalId) {
            query += ` AND i.professional_id = ?`;
            params.push(parseInt(professionalId));
        }

        query += ` ORDER BY i.created_at DESC`;

        console.log('🔵 Query:', query);
        console.log('🔵 Parámetros:', params);

        const [rows] = await pool.query<InsightRow[]>(query, params);
        console.log(`✅ ${rows.length} insights encontrados`);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('❌ Error fetching insights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch insights', details: String(error) },
            { status: 500 }
        );
    }
}

// POST - Crear un nuevo insight
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('🔵 POST /api/insights - Body:', body);
        
        const { checkin_id, professional_id, content } = body;

        if (!checkin_id || !professional_id || !content) {
            return NextResponse.json(
                { error: 'checkin_id, professional_id, and content are required' },
                { status: 400 }
            );
        }

        // Verificar que el checkin existe
        const [checkinExists] = await pool.query(
            'SELECT checkin_id FROM checkins WHERE checkin_id = ?',
            [checkin_id]
        );

        if ((checkinExists as any[]).length === 0) {
            return NextResponse.json(
                { error: `Checkin ${checkin_id} not found` },
                { status: 404 }
            );
        }

        // Verificar que el profesional existe
        const [professionalExists] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [professional_id]
        );

        if ((professionalExists as any[]).length === 0) {
            return NextResponse.json(
                { error: `Professional ${professional_id} not found` },
                { status: 404 }
            );
        }

        // Insertar en insights
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO insights (checkin_id, professional_id, content, created_at)
             VALUES (?, ?, ?, NOW())`,
            [checkin_id, professional_id, content]
        );

        console.log(`✅ Insight creado con ID: ${result.insertId}`);

        const [newInsight] = await pool.query(
            `SELECT 
                i.insight_id,
                i.checkin_id,
                i.professional_id,
                i.content,
                i.created_at,
                u.first_name,
                u.last_name
            FROM insights i
            LEFT JOIN users u ON i.professional_id = u.user_id
            WHERE i.insight_id = ?`,
            [result.insertId]
        );

        return NextResponse.json({
            success: true,
            insight: (newInsight as any[])[0],
            insight_id: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating insight:', error);
        return NextResponse.json(
            { error: 'Failed to create insight', details: String(error) },
            { status: 500 }
        );
    }
}