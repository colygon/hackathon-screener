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

    // Build update fields dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (approval_status) {
      updates.push('approval_status');
      values.push(approval_status);
    }
    if (gender) {
      updates.push('gender');
      values.push(gender);
    }

    // Update the applicant
    const result = approval_status && gender
      ? await sql`
          UPDATE applicants
          SET 
            approval_status = ${approval_status},
            gender = ${gender},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
      : approval_status
      ? await sql`
          UPDATE applicants
          SET 
            approval_status = ${approval_status},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
      : await sql`
          UPDATE applicants
          SET 
            gender = ${gender},
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
