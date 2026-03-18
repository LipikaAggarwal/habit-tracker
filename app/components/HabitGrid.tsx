'use client';

import { useMemo, useState } from 'react';

interface Task {
  id: number;
  name: string;
  color: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  completed?: boolean;
}

interface HabitLog {
  id: number;
  taskId: number;
  date: string;
  completed: boolean;
}

interface HabitGridProps {
  tasks: Task[];
  habitLogs: HabitLog[];
  selectedTaskId: number | null;
  onToggleCompletion: (taskId: number, date: string, completed: boolean) => Promise<void>;
}

export default function HabitGrid({
  tasks,
  habitLogs,
  selectedTaskId,
  onToggleCompletion,
}: HabitGridProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const visibleTasks = selectedTaskId
    ? tasks.filter((task) => task.id === selectedTaskId)
    : tasks;

  const getTaskWindow = (task: Task) => {
    const start = new Date(task.startDate);
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    const end = task.endDate ? new Date(task.endDate) : today;
    const rawEndDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const endDate = rawEndDate > today ? today : rawEndDate;

    return { startDate, endDate };
  };

  const getTaskWeeks = (task: Task) => {
    const { startDate, endDate } = getTaskWindow(task);
    const weeks: Array<Array<Date | null>> = [];

    const calendarStart = new Date(startDate);
    calendarStart.setDate(startDate.getDate() - startDate.getDay());

    const cursor = new Date(calendarStart);
    while (cursor <= endDate) {
      const week: Array<Date | null> = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(cursor);
        if (d < startDate || d > endDate) {
          week.push(null);
        } else {
          week.push(d);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const isCompleted = (taskId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habitLogs.some(
      (log) => log.taskId === taskId && log.date.split('T')[0] === dateStr && log.completed
    );
  };

  const handleSquareClick = async (taskId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const current = isCompleted(taskId, date);

    try {
      setIsUpdating(true);
      await onToggleCompletion(taskId, dateStr, !current);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getMonthYearLabels = (weeks: Array<Array<Date | null>>) => {
    const labels: Array<{ weekIndex: number; label: string }> = [];
    let lastKey = '';

    weeks.forEach((week, weekIndex) => {
      const first = week.find((d) => d !== null);
      if (!first) return;

      const month = first.toLocaleDateString('en-US', { month: 'short' });
      const year = first.getFullYear();
      const key = `${month}-${year}`;

      if (key !== lastKey) {
        labels.push({ weekIndex, label: `${month} ${year}` });
        lastKey = key;
      }
    });

    return labels;
  };

  if (visibleTasks.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="text-zinc-400">No task selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleTasks.map((task) => {
        const weeks = getTaskWeeks(task);
        const labels = getMonthYearLabels(weeks);

        return (
          <div key={task.id} className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{task.name}</h3>
                <p className="text-xs text-zinc-500">
                  {new Date(task.startDate).toLocaleDateString()} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
              {task.completed ? (
                <span className="rounded bg-emerald-900/30 px-2 py-1 text-xs text-emerald-300">Completed</span>
              ) : (
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Active</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <div className="relative min-w-fit pl-2">
                {labels.map((label) => (
                  <span
                    key={`${task.id}-${label.weekIndex}`}
                    className="absolute -top-5 text-[11px] text-zinc-500"
                    style={{ left: `${label.weekIndex * 15}px` }}
                  >
                    {label.label}
                  </span>
                ))}

                <div className="mt-6 flex gap-0.5">
                  {weeks.map((week, weekIndex) => (
                    <div key={`${task.id}-week-${weekIndex}`} className="flex flex-col gap-0.5">
                      {week.map((date, dayIndex) => {
                        if (!date) {
                          return (
                            <div
                              key={`${task.id}-empty-${weekIndex}-${dayIndex}`}
                              className="h-3.5 w-3.5 rounded-sm border border-zinc-800 bg-zinc-950/70"
                            />
                          );
                        }

                        const done = isCompleted(task.id, date);
                        return (
                          <button
                            key={`${task.id}-${date.toISOString()}`}
                            onClick={() => handleSquareClick(task.id, date)}
                            disabled={isUpdating || task.completed}
                            className="h-3.5 w-3.5 rounded-sm border transition-all hover:scale-105"
                            style={{
                              borderColor: done ? task.color : '#3f3f46',
                              backgroundColor: done ? task.color : '#18181b',
                              opacity: task.completed ? 0.6 : 1,
                              cursor: task.completed ? 'not-allowed' : 'pointer',
                            }}
                            title={`${task.name} - ${date.toDateString()} (${done ? 'done' : 'pending'})`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
