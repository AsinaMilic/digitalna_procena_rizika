const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Konfiguracija baze podataka
const connectionString = process.env.DATABASE_URL_POSTGRES;

if (!connectionString) {
    console.error('DATABASE_URL_POSTGRES environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateSifraDelatnostiColumn() {
    try {
        console.log('🔧 Starting migration to update sifra_delatnosti column length...');

        // Check current column definition
        const checkResult = await pool.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'pravnolice' AND column_name = 'sifra_delatnosti'
    `);

        if (checkResult.rows.length > 0) {
            console.log(`Current length: ${checkResult.rows[0].character_maximum_length}`);
        }

        // Alter the column
        await pool.query('ALTER TABLE PravnoLice ALTER COLUMN sifra_delatnosti TYPE VARCHAR(255)');

        console.log('✅ Successfully updated sifra_delatnosti to VARCHAR(255)');

        // Check new column definition
        const verifyResult = await pool.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'pravnolice' AND column_name = 'sifra_delatnosti'
    `);

        if (verifyResult.rows.length > 0) {
            console.log(`New length: ${verifyResult.rows[0].character_maximum_length}`);
        } else {
            console.log('Could not verify new length.');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await pool.end();
    }
}

updateSifraDelatnostiColumn();
