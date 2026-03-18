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

    const tasks = await db.task.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const tasksWithStatus = tasks.map((task) => {
      const goalReached =
        !!task.endDate &&
        new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate()) <= todayStart;

      return {
        ...task,
        completed: goalReached,
      };
    });

    return NextResponse.json({ tasks: tasksWithStatus }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, color, description, startDate, endDate } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    // Validate color format (hex)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF5733)' },
        { status: 400 }
      );
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const startDateOnly = new Date(
      parsedStartDate.getFullYear(),
      parsedStartDate.getMonth(),
      parsedStartDate.getDate()
    );

    let parsedEndDate: Date | null = null;
    if (endDate !== undefined && endDate !== null && endDate !== '') {
      const rawEndDate = new Date(endDate);
      parsedEndDate = new Date(
        rawEndDate.getFullYear(),
        rawEndDate.getMonth(),
        rawEndDate.getDate()
      );

      if (parsedEndDate < startDateOnly) {
        return NextResponse.json(
          { error: 'End date cannot be before start date' },
          { status: 400 }
        );
      }
    }

    const task = await db.task.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        color,
        description: description?.trim() || null,
        startDate: startDateOnly,
        endDate: parsedEndDate,
      },
    });

    return NextResponse.json(
      {
        task: {
          ...task,
          completed: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
