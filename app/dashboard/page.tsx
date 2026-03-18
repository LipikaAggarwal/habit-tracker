'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HabitGrid from '../components/HabitGrid';

interface Task {
  id: number;
  userId: number;
  name: string;
  color: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HabitLog {
  id: number;
  taskId: number;
  userId: number;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('User');
  const [email, setEmail] = useState('');

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [taskMenuOpenId, setTaskMenuOpenId] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskColor, setTaskColor] = useState('#3B82F6');
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskEndDate, setTaskEndDate] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!userResponse.ok) {
          router.push('/auth/login');
          return;
        }

        const userData = await userResponse.json();
        setName(userData.name || 'User');
        setEmail(userData.email || '');

        const tasksResponse = await fetch('/api/tasks', {
          method: 'GET',
          credentials: 'include',
        });

        if (!tasksResponse.ok) {
          router.push('/auth/login');
          return;
        }

        const tasksData = await tasksResponse.json();
        const loadedTasks: Task[] = tasksData.tasks || [];
        setTasks(loadedTasks);
        if (loadedTasks.length > 0) {
          setSelectedTaskId(loadedTasks[0].id);
        }

        const logsResponse = await fetch('/api/habits', {
          method: 'GET',
          credentials: 'include',
        });

        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setHabitLogs(logsData.logs || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const refreshTasks = async () => {
    const response = await fetch('/api/tasks', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return;
    const data = await response.json();
    setTasks(data.tasks || []);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      alert('Task name is required');
      return;
    }

    setAddingTask(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: taskName,
          color: taskColor,
          description: taskDescription,
          startDate: taskStartDate,
          endDate: taskEndDate || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to create task');
        return;
      }

      const created: Task = data.task;
      setTasks((prev) => [created, ...prev]);
      setSelectedTaskId(created.id);

      setTaskName('');
      setTaskDescription('');
      setTaskColor('#3B82F6');
      setTaskStartDate(new Date().toISOString().split('T')[0]);
      setTaskEndDate('');
      setShowAddTask(false);
    } catch (error) {
      console.error('Add task error:', error);
      alert('Error creating task');
    } finally {
      setAddingTask(false);
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditName(task.name);
    setEditDescription(task.description || '');
    setEditColor(task.color);
    setEditStartDate(task.startDate.split('T')[0]);
    setEditEndDate(task.endDate ? task.endDate.split('T')[0] : '');
    setTaskMenuOpenId(null);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    const response = await fetch(`/api/tasks/${editingTaskId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        color: editColor,
        description: editDescription,
        startDate: editStartDate,
        endDate: editEndDate || null,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Failed to update task');
      return;
    }

    setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? data.task : task)));
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      alert('Failed to delete task');
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setHabitLogs((prev) => prev.filter((log) => log.taskId !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const handleToggleCompletion = async (taskId: number, date: string, completed: boolean) => {
    const response = await fetch('/api/habits/check', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, date, completed }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Failed to update completion');
      return;
    }

    setHabitLogs((prev) => {
      const idx = prev.findIndex((log) => log.taskId === taskId && log.date.split('T')[0] === date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data.habitLog;
        return copy;
      }
      return [...prev, data.habitLog];
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.error || 'Unable to update password');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Password update error:', error);
      setPasswordError('Unexpected error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-zinc-950 to-zinc-900">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-zinc-950 to-zinc-900">
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:text-white">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-600 text-[10px] font-bold text-zinc-200">HT</span>
            Habit Tracker
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-100"
            >
              {name}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-12 z-30 w-56 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
                <p className="px-2 py-2 text-xs text-zinc-500">{email}</p>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full rounded px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  Update Password
                </button>
                <button onClick={handleLogout} className="w-full rounded px-2 py-2 text-left text-sm text-red-300 hover:bg-red-900/20">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <section className="rounded-xl border border-zinc-700/80 bg-zinc-900/65 p-5 shadow-xl shadow-black/30">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Create Task</h2>
            <button
              onClick={() => setShowAddTask((prev) => !prev)}
              className="rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
            >
              {showAddTask ? 'Close' : 'New Task'}
            </button>
          </div>

          {showAddTask && (
            <form onSubmit={handleAddTask} className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-700/80 bg-zinc-950/60 p-4 md:grid-cols-2 lg:grid-cols-3">
              <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Task name" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500" />
              <input type="text" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Description" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500" />
              <div className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2">
                <span className="text-sm text-zinc-400">Color</span>
                <input type="color" value={taskColor} onChange={(e) => setTaskColor(e.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" />
                <span className="text-xs text-zinc-500">{taskColor}</span>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Start Date</label>
                <input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">End Date (optional)</label>
                <input type="date" value={taskEndDate} onChange={(e) => setTaskEndDate(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
              </div>
              <button type="submit" disabled={addingTask} className="rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:bg-zinc-400 lg:self-end">
                {addingTask ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-zinc-700/80 bg-zinc-900/65 p-5 shadow-xl shadow-black/30">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Tasks</h2>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Show All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg border p-4 transition ${selectedTaskId === task.id ? 'border-zinc-300 bg-zinc-800/80' : 'border-zinc-700/80 bg-zinc-800/40'}`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <button onClick={() => setSelectedTaskId(task.id)} className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm border border-zinc-500" style={{ backgroundColor: task.color }} />
                      <p className="font-semibold text-zinc-100">{task.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(task.startDate).toLocaleDateString()} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </button>

                  <div className="relative">
                    <button onClick={() => setTaskMenuOpenId((prev) => (prev === task.id ? null : task.id))} className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-700">
                      ⋮
                    </button>
                    {taskMenuOpenId === task.id && (
                      <div className="absolute right-0 z-20 w-40 rounded border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                        <button onClick={() => openEditTask(task)} className="w-full rounded px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800">
                          Edit task
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="w-full rounded px-2 py-2 text-left text-sm text-red-300 hover:bg-red-900/20">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-400">{task.description || 'No description'}</p>
                {task.completed && <p className="mt-2 text-xs font-semibold text-emerald-300">Task completed</p>}
              </div>
            ))}
          </div>
        </section>

        {editingTaskId && (
          <section className="rounded-xl border border-zinc-700/80 bg-zinc-900/65 p-5 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">Edit Task</h2>
            <form onSubmit={handleUpdateTask} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Task name" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500" />
              <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500" />
              <div className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2">
                <span className="text-sm text-zinc-400">Color</span>
                <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Start Date</label>
                <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">End Date</label>
                <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={updatingTask} className="rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:bg-zinc-400">
                  {updatingTask ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditingTaskId(null)} className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-xl border border-zinc-700/80 bg-zinc-900/65 p-5 shadow-xl shadow-black/30">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            {selectedTask ? `${selectedTask.name} Grid` : 'All Task Grids'}
          </h2>
          <HabitGrid
            tasks={tasks}
            habitLogs={habitLogs}
            selectedTaskId={selectedTaskId}
            onToggleCompletion={handleToggleCompletion}
          />
        </section>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Update Password</h3>
            {passwordError && <p className="mb-3 rounded border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">{passwordError}</p>}
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
              <input type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={updatingPassword} className="rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:bg-zinc-400">
                  {updatingPassword ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
