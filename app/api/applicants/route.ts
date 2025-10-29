import { NextResponse } from 'next/server';
import { getAllApplicants, initializeDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Ensure database is initialized
    await initializeDatabase();
    
    const result = await getAllApplicants();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch applicants' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ applicants: result.data });
  } catch (error) {
    console.error('Get applicants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
