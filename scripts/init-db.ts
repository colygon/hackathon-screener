import { config } from 'dotenv';
import { initializeDatabase } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });

async function init() {
  console.log('Initializing database...');
  const result = await initializeDatabase();
  
  if (result.success) {
    console.log('✅ Database initialized successfully!');
  } else {
    console.error('❌ Database initialization failed:', result.error);
    process.exit(1);
  }
}

init()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
