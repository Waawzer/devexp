import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: string;
}

export async function verifyAuth(req: NextRequest): Promise<TokenPayload> {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('Token manquant');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token invalide');
  }
} 