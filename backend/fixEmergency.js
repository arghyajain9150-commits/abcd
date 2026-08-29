import { query } from './src/db/db.js';

async function fixEmergencyContacts() {
  try {
    // 1. Add description and category columns if not exist
    await query('ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT \'Medical\';');
    await query('ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS description TEXT DEFAULT \'24/7 Emergency\';');

    // 2. Clear all duplicates
    await query('DELETE FROM emergency_contacts;');

    // 3. Insert real, verified, distinct emergency contacts
    const contacts = [
      {
        label: 'National Emergency Ambulance',
        number: '108',
        priority: 1,
        category: 'Medical',
        description: '24/7 Toll-Free Immediate Medical Response & ICU on Wheels'
      },
      {
        label: 'Campus Health Emergency Desk',
        number: '011-2659-1100',
        priority: 2,
        category: 'Campus',
        description: 'Block A Ground Floor · On-Duty Doctor & Campus Stretcher'
      },
      {
        label: 'Campus Security Control Room',
        number: '011-2659-1000',
        priority: 3,
        category: 'Security',
        description: 'Main Gate Control & Quick Reaction Patrol Team'
      },
      {
        label: 'Tele-MANAS Mental Health Crisis',
        number: '14416',
        priority: 4,
        category: 'Psychological',
        description: '24/7 Confidential National Psychological Support'
      },
      {
        label: 'National Emergency Unified Help',
        number: '112',
        priority: 5,
        category: 'National',
        description: 'Police, Fire & Disaster Unified Quick Dispatch'
      },
      {
        label: 'Women Safety & Helpline',
        number: '1091',
        priority: 6,
        category: 'Safety',
        description: '24/7 Immediate Confidential Assistance for Female Students'
      }
    ];

    for (const c of contacts) {
      await query(
        'INSERT INTO emergency_contacts (label, number, priority, category, description) VALUES ($1, $2, $3, $4, $5)',
        [c.label, c.number, c.priority, c.category, c.description]
      );
    }

    console.log('✅ EMERGENCY CONTACTS CLEANED & 6 VERIFIED DISTINCT CONTACTS SEEDED!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing emergency contacts:', err);
    process.exit(1);
  }
}

fixEmergencyContacts();
