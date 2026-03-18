import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookie
    await clearAuthCookie();

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
