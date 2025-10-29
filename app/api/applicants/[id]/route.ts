import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { approval_status } = await request.json();
    const id = params.id;

    if (!approval_status) {
      return NextResponse.json(
        { error: 'approval_status is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE applicants
      SET 
        approval_status = ${approval_status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      applicant: result.rows[0] 
    });
  } catch (error) {
    console.error('Update applicant error:', error);
    return NextResponse.json(
      { error: 'Failed to update applicant' },
      { status: 500 }
    );
  }
}
