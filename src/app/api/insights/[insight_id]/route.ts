// app/api/insights/[insight_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ insight_id: string }> }
) {
    try {
        const { insight_id } = await params;

        console.log('🔵 DELETE /api/insights/[insight_id] - ID:', insight_id);

        if (!insight_id) {
            return NextResponse.json(
                { error: 'insight_id is required' },
                { status: 400 }
            );
        }

        // Verificar que el insight existe
        const [existing] = await pool.query(
            'SELECT insight_id FROM insights WHERE insight_id = ?',
            [insight_id]
        );

        if ((existing as any[]).length === 0) {
            return NextResponse.json(
                { error: `Insight ${insight_id} not found` },
                { status: 404 }
            );
        }

        // Eliminar el insight
        await pool.query('DELETE FROM insights WHERE insight_id = ?', [insight_id]);
        
        console.log(`✅ Insight ${insight_id} eliminado`);

        return NextResponse.json({ 
            success: true,
            message: 'Insight deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting insight:', error);
        return NextResponse.json(
            { error: 'Failed to delete insight', details: String(error) },
            { status: 500 }
        );
    }
}
