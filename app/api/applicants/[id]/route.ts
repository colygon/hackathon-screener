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

    // Build dynamic update query
    let updateFields = [];
    let values: any[] = [];
    
    if (approval_status) {
      updateFields.push('approval_status = $' + (values.length + 1));
      values.push(approval_status);
    }
    
    if (gender) {
      updateFields.push('gender = $' + (values.length + 1));
      values.push(gender);
    }
    
    values.push(id);
    const idParam = '$' + values.length;

    const result = await sql.query(
      `UPDATE applicants
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ${idParam}
       RETURNING *`,
      values
    );

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
