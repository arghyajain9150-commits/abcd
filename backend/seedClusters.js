import { query } from './src/db/db.js';

async function seedClusters() {
  try {
    // 1. Get a doctor and existing users
    const docRes = await query('SELECT id FROM doctors LIMIT 1');
    const docId = docRes.rows[0]?.id;

    const studentRes = await query('SELECT id, name FROM users WHERE role = \'student\' LIMIT 1');
    const studentId = studentRes.rows[0]?.id;

    if (!docId || !studentId) {
      console.log('Missing doctor or student');
      process.exit(0);
    }

    // 2. Create historical sample diagnostic events for spatial cluster demo
    const sampleCases = [
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 1 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 2 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 2 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 3 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 3 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 4 },
      { diagnosis: 'Viral Conjunctivitis (Eye Flu)', daysAgo: 4 },
    ];

    for (const c of sampleCases) {
      const rx = await query(
        `INSERT INTO prescriptions (doctor_id, student_id, diagnosis, notes, status, created_at)
         VALUES ($1, $2, $3, 'Isolate in hostel room. Wash hands regularly.', 'dispensed', NOW() - ($4 || ' days')::INTERVAL)
         RETURNING id`,
        [docId, studentId, c.diagnosis, c.daysAgo]
      );

      await query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration_days, instructions)
         VALUES ($1, 'Ciprofloxacin Eye Drops', '0.3% w/v', '1 drop each eye 3x/day', 5, 'Instill in both eyes')`,
        [rx.rows[0].id]
      );
    }

    console.log('✅ 7 SPATIAL CONTAGION DIAGNOSTIC EVENTS SEEDED IN SUPABASE!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding cluster diagnostics:', err);
    process.exit(1);
  }
}

seedClusters();
