// app/api/portal/reflections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface CheckinRow extends RowDataPacket {
    checkin_id: number;
    user_id: number;
    note: string | null;
    emotion_id: number;
    created_at: string;
}

// ✅ Mapeo correcto basado en tu tabla emotions
function mapEmotionIdToCategory(emotionId: number): string {
    const emotionMap: { [key: number]: string } = {
        1: 'joy',
        2: 'calm',
        3: 'sadness',
        4: 'anger',
        5: 'anxiety',  // Fear se mapea a anxiety para la UI
        6: 'disgust',
        7: 'surprise',
        8: 'trust'
    };
    return emotionMap[emotionId] || 'unknown';
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const emotionId = searchParams.get('emotion_id');
        const sort = searchParams.get('sort') || 'DESC';

        // ✅ Usar nombres de columna directamente
        let query = `
            SELECT 
                checkin_id,
                user_id,
                note,
                emotion_id,
                created_at
            FROM checkins
            WHERE 1=1
        `;

        const params: (string | number)[] = [];

        if (emotionId && emotionId !== 'all') {
            const parsedId = parseInt(emotionId, 10);
            if (!isNaN(parsedId) && parsedId >= 1 && parsedId <= 8) {
                query += ' AND emotion_id = ?';
                params.push(parsedId);
            }
        }

        const validSort = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY created_at ${validSort}`;

        console.log('🔵 GET /api/portal/reflections - Query:', query);
        console.log('🔵 Parámetros:', params);

        const [rows] = await pool.query<CheckinRow[]>(query, params);
        console.log(`✅ ${rows.length} checkins encontrados`);

        // ✅ Verificar que los datos existen
        if (rows.length > 0) {
            console.log('🔍 Primer checkin:', {
                checkin_id: rows[0].checkin_id,
                user_id: rows[0].user_id,
                note: rows[0].note,
                emotion_id: rows[0].emotion_id,
                created_at: rows[0].created_at
            });
        }

        // ✅ Formatear los datos correctamente
        const formatted = rows.map((row) => ({
            id: row.checkin_id,
            user_id: String(row.user_id),
            content: row.note || '',
            category: mapEmotionIdToCategory(row.emotion_id),
            timestamp: row.created_at,
            status: 'pending',
            draft_recommendation: null,
            tag: null,
            checkin_id: row.checkin_id,
        }));

        console.log('📤 Primeros 3 datos:', formatted.slice(0, 3));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('❌ Error fetching checkins:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch checkins',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('🔵 PUT /api/portal/reflections - Body:', body);
        
        const { id, draft_recommendation } = body;

        if (!id || typeof id !== 'number') {
            return NextResponse.json(
                { error: 'Valid id is required' },
                { status: 400 }
            );
        }

        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT checkin_id FROM checkins WHERE checkin_id = ?',
            [id]
        );

        if (existing.length === 0) {
            return NextResponse.json(
                { error: `Checkin ${id} not found` },
                { status: 404 }
            );
        }

        if (draft_recommendation !== undefined && draft_recommendation !== null) {
            await pool.query<ResultSetHeader>(
                'UPDATE checkins SET note = ? WHERE checkin_id = ?',
                [draft_recommendation, id]
            );
            console.log(`✅ Checkin ${id} actualizado con nota`);
        }

        return NextResponse.json({
            success: true,
            message: 'Reflection updated successfully',
        });
    } catch (error) {
        console.error('❌ Error updating reflection:', error);
        return NextResponse.json(
            {
                error: 'Failed to update reflection',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}