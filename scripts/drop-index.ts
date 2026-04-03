import { connectToDatabase } from '../lib/database/connect';
import User from '../lib/database/models/user.model';

const run = async () => {
  try {
    await connectToDatabase();
    await User.collection.dropIndex('clerkId_1');
    console.log('Dropped clerkId_1 index successfully');
  } catch (e: any) {
    console.error('Error dropping index:', e.message);
  }
  process.exit(0);
};

run();
