'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Signup successful, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-black via-zinc-950 to-zinc-900 p-4">
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:text-white"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-600 text-[10px] font-bold text-zinc-200">HT</span>
        Habit Tracker
      </Link>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-8 h-64 w-64 rounded-full bg-zinc-700/10 blur-3xl" />
        <div className="absolute -right-8 bottom-8 h-80 w-80 rounded-full bg-zinc-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-8 shadow-xl shadow-black/30 backdrop-blur">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Create Account</p>
          <h1 className="mb-2 text-3xl font-semibold text-zinc-100">Sign Up</h1>
          <p className="mb-8 text-zinc-400">Start tracking your habits with a clean visual grid.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800/90 px-4 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800/90 px-4 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800/90 px-4 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800/90 px-4 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-zinc-100 py-2 font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-500"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-zinc-200 hover:text-white">
              Log in
            </Link>
          </p>

          <div className="mt-5 border-t border-zinc-800 pt-4">
            <Link href="/" className="text-xs uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-300">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
