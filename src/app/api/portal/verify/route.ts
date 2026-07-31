// app/api/verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface VerificationRow extends RowDataPacket {
  user_id: number;
  professional_id: number;
  institution_name: string | null;
  primary_specialty: string;
  verification_status: string;
  verification_date: string;
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

    const [rows] = await pool.query<VerificationRow[]>(
      `SELECT 
        user_id,
        professional_id,
        institution_name,
        primary_specialty,
        verification_status,
        verification_date
      FROM professional_verification
      WHERE user_id = ?
      ORDER BY verification_date DESC
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'No verification found'
      });
    }

    const row = rows[0];
    return NextResponse.json({
      verified: row.verification_status === 'verified',
      professional_id: row.professional_id,
      user_id: row.user_id,
      institution_name: row.institution_name,
      primary_specialty: row.primary_specialty,
      verification_status: row.verification_status,
      verification_date: row.verification_date,
    });
  } catch (error) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}
