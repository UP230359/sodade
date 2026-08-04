import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM checkins WHERE checkin_id = ?',
            [id]
        );
        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Checkin not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch checkin' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        await pool.query<ResultSetHeader>(
            'UPDATE checkins SET note = ?, shared_anonymously = ? WHERE checkin_id = ?',
            [body.note, body.shared_anonymously, id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to update checkin' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await pool.query<ResultSetHeader>(
            'DELETE FROM checkins WHERE checkin_id = ?',
            [id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to delete checkin' },
            { status: 500 }
        );
    }
}