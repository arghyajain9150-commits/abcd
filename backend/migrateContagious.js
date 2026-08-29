import { query } from './src/db/db.js';

async function migrateContagious() {
  try {
    await query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_contagious BOOLEAN DEFAULT FALSE;");
    await query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS contagious_disease TEXT;");

    console.log('✅ DATABASE MIGRATED: is_contagious & contagious_disease ADDED TO PRESCRIPTIONS!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateContagious();
