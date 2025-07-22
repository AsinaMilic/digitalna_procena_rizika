#!/usr/bin/env tsx

import { getDbConnection } from '../lib/db';

async function updatePrilogMSchema() {
  console.log('🔄 Ažuriram šemu PrilogM tabele...');
  
  try {
    const pool = await getDbConnection();
    
    // Dodaj nove kolone ako ne postoje
    const alterQueries = [
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS stepenIzlozenosti INTEGER DEFAULT 3`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS stepenRanjivosti INTEGER DEFAULT 3`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS stvarnaSteta DECIMAL(15,2) DEFAULT 0`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS poslovniPrihodi DECIMAL(15,2) DEFAULT 1000000`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS vrednostImovine DECIMAL(15,2) DEFAULT 5000000`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS delatnost VARCHAR(100) DEFAULT 'default'`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS stepenSS INTEGER`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS stepenVMSH INTEGER`,
      `ALTER TABLE PrilogM ADD COLUMN IF NOT EXISTS vmshIznos DECIMAL(15,2)`
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log('✅ Izvršeno:', query.substring(0, 50) + '...');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('already exists')) {
          console.log('ℹ️  Kolona već postoji:', query.substring(0, 50) + '...');
        } else {
          console.error('❌ Greška:', err.message);
        }
      }
    }
    
    console.log('✅ Šema PrilogM tabele je uspešno ažurirana!');
    
  } catch (error) {
    console.error('❌ Greška pri ažuriranju šeme:', error);
    process.exit(1);
  }
}

// Pokreni ažuriranje
updatePrilogMSchema().then(() => {
  console.log('🎉 Ažuriranje završeno!');
  process.exit(0);
});