// src/app/api/portal/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ProfileRow extends RowDataPacket {
    user_id: number;
    professional_cedula: string;
    institution_name: string | null;
    primary_specialty: string;
    verification_status: string;
    verification_date: string | null;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('user_id');
        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        const [userExists] = await pool.query<RowDataPacket[]>(
            'SELECT user_id FROM users WHERE user_id = ?',
            [userId]
        );
        if (userExists.length === 0) {
            return NextResponse.json({
                verified: false,
                message: 'User not found',
            });
        }

        const [rows] = await pool.query<ProfileRow[]>(
            `SELECT 
                user_id,
                professional_cedula,
                institution_name,
                primary_specialty,
                verification_status,
                verification_date
            FROM professional_profiles
            WHERE user_id = ?
            ORDER BY verification_date DESC
            LIMIT 1`,
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({
                verified: false,
                message: 'No professional profile found',
            });
        }

        const row = rows[0];
        return NextResponse.json({
            verified: row.verification_status === 'active',
            user_id: row.user_id,
            professional_cedula: row.professional_cedula,
            institution_name: row.institution_name,
            primary_specialty: row.primary_specialty,
            verification_status: row.verification_status,
            verification_date: row.verification_date,
        });
    } catch (error) {
        console.error('Error fetching verification:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verification', details: String(error) },
            { status: 500 }
        );
    }
}