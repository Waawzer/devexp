import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();
  
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;
  
      const users = await User.find({}, 'username email role').skip(skip).limit(limit);
      const total = await User.countDocuments();
  
      return NextResponse.json({ users, total, page, limit }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Erreur lors de la récupération des utilisateurs', error: (error as Error).message },
        { status: 500 }
      );
    }
  }