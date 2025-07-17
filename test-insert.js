// Simple test to insert a record directly
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

async function insertTestRecord() {
    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        // First, let's check if we have any PravnaLica records
        const pravnaLica = await pool.request().query('SELECT TOP 1 id FROM PravnaLica');
        
        let pravnoLiceId;
        if (pravnaLica.recordset.length === 0) {
            // Create a test PravnoLice first
            const newPravnoLice = await pool.request()
                .query(`
                    INSERT INTO PravnaLica (naziv, pib, adresa)
                    OUTPUT INSERTED.id
                    VALUES ('Test Kompanija d.o.o.', '123456789', 'Test adresa 123, Beograd')
                `);
            pravnoLiceId = newPravnoLice.recordset[0].id;
            console.log(`✅ Test pravno lice kreirano sa ID: ${pravnoLiceId}`);
        } else {
            pravnoLiceId = pravnaLica.recordset[0].id;
            console.log(`✅ Koristim postojeće pravno lice sa ID: ${pravnoLiceId}`);
        }

        const result = await pool.request()
            .query(`
                INSERT INTO ProcenaRizika (pravnoLiceId, datum, status)
                OUTPUT INSERTED.id
                VALUES (${pravnoLiceId}, GETDATE(), 'u_toku')
            `);
        
        const procenaId = result.recordset[0].id;
        console.log(`✅ Test procena kreirana sa ID: ${procenaId}`);
        console.log(`🌐 Test URL: http://localhost:3000/optimized-risk/${procenaId}`);
        
        await pool.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Greška:', error);
        process.exit(1);
    }
}

insertTestRecord();