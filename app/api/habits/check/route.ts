import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId, date, completed } = await request.json();

    if (taskId === undefined || !date || completed === undefined) {
      return NextResponse.json(
        { error: 'taskId, date, and completed are required' },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Parse date string to Date object (YYYY-MM-DD format)
    const habitDate = new Date(date);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const habitDateStart = new Date(habitDate.getFullYear(), habitDate.getMonth(), habitDate.getDate());

    if (habitDateStart > todayStart) {
      return NextResponse.json(
        { error: 'Cannot update future dates' },
        { status: 400 }
      );
    }

    const taskStart = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
    if (habitDateStart < taskStart) {
      return NextResponse.json(
        { error: 'Cannot update before task start date' },
        { status: 400 }
      );
    }

    if (task.endDate) {
      const taskEnd = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
      if (habitDateStart > taskEnd) {
        return NextResponse.json(
          { error: 'This task has ended. Further updates are disabled.' },
          { status: 400 }
        );
      }
    }

    // Upsert: create or update habit log for this task and date
    const habitLog = await db.habitLog.upsert({
      where: {
        taskId_date: {
          taskId,
          date: habitDate,
        },
      },
      create: {
        taskId,
        userId: user.userId,
        date: habitDate,
        completed,
      },
      update: {
        completed,
      },
    });

    return NextResponse.json({ habitLog }, { status: 200 });
  } catch (error) {
    console.error('Check habit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
