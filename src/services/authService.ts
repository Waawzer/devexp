import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserInput } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login error');
    }

    return response.json();
  },

  async register(userData: UserInput) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration error');
    }

    return response.json();
  },

  verifyToken(token: string) {
    if (!token) {
      throw new Error('Token missing');
    }

    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}; 