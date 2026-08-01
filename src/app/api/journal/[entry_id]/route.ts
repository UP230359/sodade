// app/api/journal/[entry_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// DELETE - Eliminar una entrada
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entry_id: string }> }
) {
    try {
        const { entry_id } = await params;

        console.log('🔵 DELETE /api/journal/[entry_id] - ID:', entry_id);

        if (!entry_id) {
            return NextResponse.json(
                { error: 'entry_id is required' },
                { status: 400 }
            );
        }

        // Verificar que la entrada existe
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT entry_id FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );

        if (existing.length === 0) {
            return NextResponse.json(
                { error: `Entry ${entry_id} not found` },
                { status: 404 }
            );
        }

        // Eliminar la entrada
        await pool.query<ResultSetHeader>(
            'DELETE FROM journal_entries WHERE entry_id = ?',
            [entry_id]
        );

        console.log(`✅ Entry ${entry_id} eliminada`);

        return NextResponse.json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete entry', details: String(error) },
            { status: 500 }
        );
    }
}