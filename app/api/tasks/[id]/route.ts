import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, color, description, startDate, endDate } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code' },
        { status: 400 }
      );
    }

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const startDateOnly = parsedStartDate
      ? new Date(parsedStartDate.getFullYear(), parsedStartDate.getMonth(), parsedStartDate.getDate())
      : null;

    let parsedEndDate: Date | null = null;
    if (endDate !== undefined && endDate !== null && endDate !== '') {
      const rawEndDate = new Date(endDate);
      parsedEndDate = new Date(rawEndDate.getFullYear(), rawEndDate.getMonth(), rawEndDate.getDate());
    }

    // Verify task belongs to user
    const task = await db.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!task || task.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const effectiveStart = startDateOnly || task.startDate;
    if (parsedEndDate && parsedEndDate < effectiveStart) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      );
    }

    const updatedTask = await db.task.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        color,
        description: description?.trim() || null,
        startDate: effectiveStart,
        endDate: parsedEndDate,
      },
    });

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify task belongs to user
    const task = await db.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!task || task.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await db.task.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { success: true, message: 'Task deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
