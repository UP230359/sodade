// app/api/journal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('🔵 1. Iniciando POST /api/journal');
        
        const body = await request.json();
        console.log('🔵 2. Body recibido:', JSON.stringify(body, null, 2));

        const { user_id, title, content } = body;

        // Validaciones
        if (!user_id) {
            console.log('🔴 Error: user_id faltante');
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        if (!content) {
            console.log('🔴 Error: content faltante');
            return NextResponse.json(
                { error: 'content is required' },
                { status: 400 }
            );
        }

        console.log('🔵 3. Validaciones OK');

        // Probar conexión a la base de datos
        try {
            console.log('🔵 4. Probando conexión a DB...');
            const [pingResult] = await pool.query('SELECT 1 as test');
            console.log('🔵 5. DB conectada:', pingResult);
        } catch (dbError) {
            console.log('🔴 Error de conexión DB:', dbError);
            return NextResponse.json(
                { 
                    error: 'Database connection failed',
                    details: String(dbError)
                },
                { status: 500 }
            );
        }

        // Insertar
        try {
            console.log('🔵 6. Insertando entrada...');
            const query = `
                INSERT INTO journal_entries (user_id, title, content, created_at, updated_at)
                VALUES (?, ?, ?, NOW(), NOW())
            `;
            const [result] = await pool.query(query, [
                user_id,
                title || 'Untitled',
                content
            ]);

            const insertId = (result as any).insertId;
            console.log('🔵 7. Entrada creada, ID:', insertId);

            // Obtener la entrada creada
            const [newEntry] = await pool.query(
                `SELECT * FROM journal_entries WHERE entry_id = ?`,
                [insertId]
            );

            console.log('🔵 8. Entrada obtenida:', (newEntry as any[])[0]);

            return NextResponse.json({ 
                success: true, 
                entry: (newEntry as any[])[0],
                entry_id: insertId 
            });

        } catch (queryError) {
            console.log('🔴 Error en query:', queryError);
            return NextResponse.json(
                { 
                    error: 'Query failed',
                    details: String(queryError)
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.log('🔴 Error general:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: String(error)
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔵 GET /api/journal');
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        const [rows] = await pool.query(
            `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        console.log(`🔵 ${(rows as any[]).length} entradas encontradas`);
        return NextResponse.json(rows);
    } catch (error) {
        console.log('🔴 GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entries' },
            { status: 500 }
        );
    }
}