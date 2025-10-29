import { NextResponse } from 'next/server';
import { getAllApplicants, initializeDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if database URL is configured
    if (!process.env.POSTGRES_URL && !process.env.NEON_POSTGRES_URL) {
      console.error('Database URL not configured');
      return NextResponse.json(
        { error: 'Database not configured', applicants: [] },
        { status: 200 }
      );
    }

    // Ensure database is initialized
    await initializeDatabase();
    
    const result = await getAllApplicants();
    
    if (!result.success) {
      console.error('Failed to fetch applicants:', result.error);
      return NextResponse.json(
        { error: 'Failed to fetch applicants', applicants: [] },
        { status: 200 }
      );
    }
    
    return NextResponse.json({ applicants: result.data || [] });
  } catch (error) {
    console.error('Get applicants error:', error);
    return NextResponse.json(
      { error: 'Internal server error', applicants: [] },
      { status: 200 }
    );
  }
}
