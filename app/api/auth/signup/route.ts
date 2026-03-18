import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { hashPassword, setAuthCookie, generateToken } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      { success: true, userId: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
