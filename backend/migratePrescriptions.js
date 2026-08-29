import { query } from './src/db/db.js';

async function migrate() {
  try {
    await query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pickup_otp TEXT;");
    await query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');");

    await query(`
      UPDATE prescriptions 
      SET pickup_otp = LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
      WHERE pickup_otp IS NULL;
    `);

    console.log('✅ DATABASE MIGRATED: pickup_otp and expires_at ADDED TO PRESCRIPTIONS!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
