import { query } from './src/db/db.js';

async function cleanDuplicateDoctors() {
  try {
    // 1. Get all unique doctors and identify duplicates
    const allDocs = await query('SELECT id, name FROM doctors ORDER BY name, id ASC;');
    
    const canonical = new Map(); // name -> primaryId
    const toDelete = []; // array of duplicateIds

    for (const doc of allDocs.rows) {
      if (!canonical.has(doc.name)) {
        canonical.set(doc.name, doc.id);
      } else {
        const primaryId = canonical.get(doc.name);
        toDelete.push({ duplicateId: doc.id, primaryId });
      }
    }

    console.log(`Found ${toDelete.length} duplicate doctor entries to merge and delete.`);

    for (const { duplicateId, primaryId } of toDelete) {
      // 1. Update prescriptions pointing to duplicate doctor
      await query('UPDATE prescriptions SET doctor_id = $1 WHERE doctor_id = $2', [primaryId, duplicateId]);

      // 2. Update appointments pointing to duplicate doctor
      await query('UPDATE appointments SET doctor_id = $1 WHERE doctor_id = $2', [primaryId, duplicateId]);

      // 3. Delete slots belonging to duplicate doctor
      await query('DELETE FROM appointments WHERE slot_id IN (SELECT id FROM slots WHERE doctor_id = $1)', [duplicateId]);
      await query('DELETE FROM slots WHERE doctor_id = $1', [duplicateId]);

      // 4. Delete duplicate doctor record
      await query('DELETE FROM doctors WHERE id = $1', [duplicateId]);
    }

    // 2. Add UNIQUE constraint on doctor name to prevent future duplicates
    try {
      await query('ALTER TABLE doctors ADD CONSTRAINT unique_doctor_name UNIQUE (name);');
      console.log('✅ Added UNIQUE constraint on doctors(name)');
    } catch (conErr) {
      console.log('Constraint note:', conErr.message);
    }

    const finalDocs = await query('SELECT id, name, specialty, opd_room FROM doctors ORDER BY name;');
    console.log('✅ Final Clean Distinct Doctors in Database:');
    console.table(finalDocs.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning duplicate doctors:', err);
    process.exit(1);
  }
}

cleanDuplicateDoctors();
