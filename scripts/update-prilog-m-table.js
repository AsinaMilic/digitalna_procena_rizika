const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Konfiguracija baze podataka
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'digitalna_procena_rizika',
  password: 'admin',
  port: 5432,
});

async function updatePrilogMTable() {
  try {
    console.log('🔧 Pokretam ažuriranje PrilogM tabele...');
    
    // Učitaj SQL skriptu
    const sqlPath = path.join(__dirname, '..', 'database', 'add_prilog_m_columns.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Izvršava SQL skriptu
    await pool.query(sqlScript);
    
    console.log('✅ PrilogM tabela uspešno ažurirana');
    
    // Proverava strukturu tabele nakon ažuriranja
    const structureResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'prilogm' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Struktura PrilogM tabele:');
    console.table(structureResult.rows);
    
  } catch (error) {
    console.error('❌ Greška pri ažuriranju PrilogM tabele:', error.message);
  } finally {
    await pool.end();
  }
}

// Pokreni ažuriranje
updatePrilogMTable();