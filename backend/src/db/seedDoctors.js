import { query } from './db.js';

async function seed() {
  try {
    await query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS qualifications TEXT DEFAULT \'MBBS, MD\';');
    await query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS opd_room TEXT DEFAULT \'Room 101\';');
    await query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS shift_hours TEXT DEFAULT \'08:30 – 13:30\';');

    const docs = [
      { name: 'Dr. Aditi Rao', qualifications: 'MBBS, MD (General Medicine)', specialty: 'General Physician', opd_room: 'OPD Room 101', shift_hours: '08:30 – 13:30', bio: 'Senior Campus Medical Officer with 12+ years experience in acute illnesses, seasonal fevers, and student preventive health.' },
      { name: 'Dr. Sanjana Iyer', qualifications: 'MBBS, MD (Dermatology & Venereology)', specialty: 'Dermatology', opd_room: 'OPD Room 103', shift_hours: '10:00 – 15:00', bio: 'Specialist in allergic skin reactions, viral conjunctivitis, hostel acne, and contact dermatitis.' },
      { name: 'Dr. Rohan Verma', qualifications: 'MBBS, MS (Orthopaedics)', specialty: 'Orthopaedics', opd_room: 'OPD Room 105', shift_hours: '14:00 – 18:30', bio: 'Campus Sports Medicine Consultant specializing in ligament sprains, fractures, gym injuries, and posture correction.' },
      { name: 'Dr. Kabir Mehta', qualifications: 'MBBS, MS (Obstetrics & Gynaecology)', specialty: 'Gynaecology', opd_room: 'OPD Room 107', shift_hours: '09:00 – 14:00', bio: 'Consultant in adolescent health, menstrual cramps, PCOD management, and nutritional deficiencies.' },
      { name: 'Dr. Meera Nambiar', qualifications: 'MBBS, MD (Psychiatry)', specialty: 'Wellness & Psychiatry', opd_room: 'Wellness Centre 201', shift_hours: '11:00 – 17:00', bio: 'Head of Campus Psychological Support, specializing in academic burnout, acute anxiety, and insomnia management.' }
    ];

    const existing = await query('SELECT id, name FROM doctors ORDER BY name ASC;');

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      let docId;
      if (existing.rows[i]) {
        docId = existing.rows[i].id;
        await query(
          'UPDATE doctors SET name = $1, qualifications = $2, specialty = $3, opd_room = $4, shift_hours = $5, bio = $6 WHERE id = $7',
          [doc.name, doc.qualifications, doc.specialty, doc.opd_room, doc.shift_hours, doc.bio, docId]
        );
      } else {
        const ins = await query(
          'INSERT INTO doctors (name, qualifications, specialty, opd_room, shift_hours, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [doc.name, doc.qualifications, doc.specialty, doc.opd_room, doc.shift_hours, doc.bio]
        );
        docId = ins.rows[0].id;
      }
    }

    // Seed slots for today, tomorrow, and day after in one bulk query
    const docList = await query('SELECT id FROM doctors;');
    const times = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '14:00:00', '14:30:00', '15:00:00'];
    const days = [0, 1, 2, 3];

    for (const d of docList.rows) {
      for (const dayOffset of days) {
        const slotDate = new Date(Date.now() + dayOffset * 86400000).toISOString().split('T')[0];
        for (const t of times) {
          await query(`
            INSERT INTO slots (doctor_id, slot_date, slot_time, is_booked)
            SELECT '${d.id}', '${slotDate}', '${t}', FALSE
            WHERE NOT EXISTS (
              SELECT 1 FROM slots WHERE doctor_id = '${d.id}' AND slot_date = '${slotDate}' AND slot_time = '${t}'
            )
          `);
        }
      }
    }

    console.log('✅ DOCTORS & SLOTS SEEDING FINISHED SUCCESSFULLY!');
    process.exit(0);
  } catch (e) {
    console.error('Seeding error:', e);
    process.exit(1);
  }
}

seed();
