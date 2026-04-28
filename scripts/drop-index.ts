import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { connectToDatabase } from '../lib/database/connect';
import User from '../lib/database/models/user.model';

const run = async () => {
  try {
    await connectToDatabase();
    await User.collection.dropIndex('clerkId_1');
    console.log('Dropped clerkId_1 index successfully');
  } catch (e: any) {
    if (e.message.includes('ns not found') || e.message.includes('index not found')) {
      console.log('Index clerkId_1 does not exist, everything is fine.');
    } else {
      console.error('Error dropping index:', e.message);
    }
  }
  process.exit(0);
};

run();
