import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const logs = await db.habitLog.findMany({
      where: { userId: user.userId },
      include: { task: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Get habit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
