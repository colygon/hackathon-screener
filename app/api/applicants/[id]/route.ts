import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const { approval_status, gender } = body;

    if (!approval_status && !gender) {
      return NextResponse.json(
        { error: 'approval_status or gender is required' },
        { status: 400 }
      );
    }

    // Update the applicant
    let result;
    
    if (approval_status && gender) {
      result = await sql`
        UPDATE applicants
        SET 
          approval_status = ${approval_status},
          gender = ${gender},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (approval_status) {
      result = await sql`
        UPDATE applicants
        SET 
          approval_status = ${approval_status},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (gender) {
      result = await sql`
        UPDATE applicants
        SET 
          gender = ${gender},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    }

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
