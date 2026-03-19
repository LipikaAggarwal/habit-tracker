"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

type HomeUser = {
  id: number;
  name: string | null;
  email: string;
};

export default function Home() {
  const [user, setUser] = useState<HomeUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    setMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-black via-zinc-950 to-zinc-900">
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:text-white"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-600 text-[10px] font-bold text-zinc-200">HT</span>
        Habit Tracker
      </Link>

      <div className="absolute right-5 top-5 z-20">
        {checkingAuth ? (
          <div className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-400">Checking session...</div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-100"
            >
              {user.name || 'Profile'}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
                <p className="px-2 py-2 text-xs text-zinc-500">{user.email}</p>
                <Link
                  href="/dashboard"
                  className="block w-full rounded px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Open Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded px-2 py-2 text-left text-sm text-red-300 hover:bg-red-900/20"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all hover:border-zinc-500 hover:bg-zinc-800"
          >
            Log In
          </Link>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-12 h-64 w-64 rounded-full bg-zinc-700/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-zinc-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-zinc-300/5 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-zinc-500">Habit Tracking Reimagined</p>
          <h1 className="mb-6 text-5xl font-semibold leading-tight text-zinc-100 md:text-6xl">
            Track Your Habits
            <span className="block text-zinc-400">with a clean visual rhythm</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
            Build better consistency with a GitHub-style habit grid. Create tasks like DSA practice, exercise, or reading,
            then fill each day with your selected color as you complete them.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center rounded-md bg-zinc-100 px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white sm:w-auto"
                >
                  Continue To Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/70 px-8 py-3 text-sm font-semibold text-zinc-100 transition-all hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex w-full items-center justify-center rounded-md bg-zinc-100 px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white sm:w-auto"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/70 px-8 py-3 text-sm font-semibold text-zinc-100 transition-all hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-left shadow-lg shadow-black/25 backdrop-blur-sm">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">Insight</p>
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">Visual Progress</h3>
              <p className="text-sm leading-7 text-zinc-400">
                See your consistency in a contribution-style view that grows day by day through the year.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-left shadow-lg shadow-black/25 backdrop-blur-sm">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">Focus</p>
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">Color Coded Habits</h3>
              <p className="text-sm leading-7 text-zinc-400">
                Assign a unique color to each habit so your weekly and monthly trends are easy to scan.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-left shadow-lg shadow-black/25 backdrop-blur-sm">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">Control</p>
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">Flexible Updates</h3>
              <p className="text-sm leading-7 text-zinc-400">
                Update missed entries while staying limited to real dates up to today for cleaner tracking.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
