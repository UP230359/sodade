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
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const professionalId = searchParams.get('professional_id');
    const checkinId = searchParams.get('checkin_id');
    const limit = searchParams.get('limit') || '50';

    let query = `
      SELECT 
        i.insight_id,
        i.checkin_id,
        i.professional_id,
        i.tag_id,
        i.content,
        i.created_at,
        t.name as tag_name
      FROM insights i
      LEFT JOIN insight_tags t ON i.tag_id = t.tag_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (professionalId) {
      query += ` AND i.professional_id = ?`;
      params.push(professionalId);
    }

    if (checkinId) {
      query += ` AND i.checkin_id = ?`;
      params.push(checkinId);
    }

    query += ` ORDER BY i.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [rows] = await pool.query<InsightRow[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkin_id, professional_id, tag_id, content } = body;

    if (!checkin_id || !professional_id || !content) {
      return NextResponse.json(
        { error: 'checkin_id, professional_id, and content are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO insights (checkin_id, professional_id, tag_id, content, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [checkin_id, professional_id, tag_id || null, content]
    );

    const insertId = result.insertId;

    const [rows] = await pool.query<InsightRow[]>(
      `SELECT 
        i.insight_id,
        i.checkin_id,
        i.professional_id,
        i.tag_id,
        i.content,
        i.created_at,
        t.name as tag_name
      FROM insights i
      LEFT JOIN insight_tags t ON i.tag_id = t.tag_id
      WHERE i.insight_id = ?`,
      [insertId]
    );

    return NextResponse.json({
      success: true,
      insight: rows[0],
      insight_id: insertId
    });
  } catch (error) {
    console.error('Error creating insight:', error);
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const insightId = searchParams.get('insight_id');

    if (!insightId) {
      return NextResponse.json(
        { error: 'insight_id is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM insights WHERE insight_id = ?', [insightId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insight:', error);
    return NextResponse.json(
      { error: 'Failed to delete insight' },
      { status: 500 }
    );
  }
}