import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import User from '@/lib/database/models/user.model';

export async function GET() {
  try {
    await connectToDatabase();
    await User.collection.dropIndex('clerkId_1');
    return NextResponse.json({ message: 'Dropped clerkId_1 index successfully' });
  } catch (e: any) {
    if (e.message.includes('ns not found') || e.message.includes('index not found')) {
      return NextResponse.json({ message: 'Index clerkId_1 does not exist, everything is fine.' });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
