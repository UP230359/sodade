// app/api/journal/[entry_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Obtener una entrada específica por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        // ✅ Desenvolver params con await
        const { entry_id } = await params;
        
        const [rows] = await pool.query(
            `SELECT 
                entry_id,
                user_id,
                title,
                content,
                created_at,
                updated_at
            FROM journal_entries
            WHERE entry_id = ?`,
            [entry_id]
        );

        const entry = (rows as any[])[0];
        if (!entry) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entry' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar una entrada específica por ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        // ✅ Desenvolver params con await
        const { entry_id } = await params;
        const body = await request.json();
        const { title, content } = body;

        // Verificar que la entrada existe
        const [existing] = await pool.query(
            'SELECT entry_id FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );

        if ((existing as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        const updates: string[] = [];
        const queryParams: any[] = [];

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
        await pool.query(query, queryParams);

        // Obtener la entrada actualizada
        const [updatedEntry] = await pool.query(
            `SELECT 
                entry_id,
                user_id,
                title,
                content,
                created_at,
                updated_at
            FROM journal_entries
            WHERE entry_id = ?`,
            [entry_id]
        );

        return NextResponse.json({ 
            success: true, 
            entry: (updatedEntry as any[])[0]
        });
    } catch (error) {
        console.error('Error updating journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to update journal entry' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar una entrada específica por ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        // ✅ Desenvolver params con await
        const { entry_id } = await params;

        // Verificar que la entrada existe
        const [existing] = await pool.query(
            'SELECT entry_id FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );

        if ((existing as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        await pool.query('DELETE FROM journal_entries WHERE entry_id = ?', [entry_id]);
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