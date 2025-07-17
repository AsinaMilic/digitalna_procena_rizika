// Check database structure
const sql = require('mssql');

const config = {
    user: 'admin123',
    password: 'Aleksa2000',
    server: 'digitalni-registar-procene-rizika.database.windows.net',
    database: 'digitalni_registar_procene_rizika',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
};

async function checkDatabaseStructure() {
    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        console.log('🔍 Checking existing tables...');
        
        // Get all tables
        const tables = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log('📋 Existing tables:');
        tables.recordset.forEach(table => {
            console.log(`  - ${table.TABLE_NAME}`);
        });
        
        // Check if ProcenaRizika table exists and its structure
        if (tables.recordset.some(t => t.TABLE_NAME === 'ProcenaRizika')) {
            console.log('\n🔍 ProcenaRizika table structure:');
            const columns = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'ProcenaRizika'
                ORDER BY ORDINAL_POSITION
            `);
            
            columns.recordset.forEach(col => {
                console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        } else {
            console.log('\n❌ ProcenaRizika table does not exist');
        }
        
        await pool.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Greška:', error.message);
        process.exit(1);
    }
}

checkDatabaseStructure();