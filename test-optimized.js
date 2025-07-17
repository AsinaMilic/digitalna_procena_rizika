// Test the optimized risk assessment
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

async function testOptimizedFlow() {
    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        // Check if we have test data
        const procenaCheck = await pool.request()
            .query('SELECT TOP 1 id FROM ProcenaRizika ORDER BY id DESC');
        
        if (procenaCheck.recordset.length > 0) {
            const procenaId = procenaCheck.recordset[0].id;
            console.log(`✅ Found test procena with ID: ${procenaId}`);
            console.log(`🌐 Test URL: http://localhost:3000/optimized-risk/${procenaId}`);
            
            // Check if we have any risk selections
            const selections = await pool.request()
                .input('procenaId', procenaId)
                .query('SELECT COUNT(*) as count FROM RiskSelection WHERE procenaId = @procenaId');
            
            console.log(`📊 Risk selections: ${selections.recordset[0].count}`);
            
            // Check if we have any Prilog M data
            const prilogM = await pool.request()
                .input('procenaId', procenaId)
                .query('SELECT COUNT(*) as count FROM PrilogM WHERE procenaId = @procenaId');
            
            console.log(`📈 Prilog M records: ${prilogM.recordset[0].count}`);
            
        } else {
            console.log('❌ No test procena found. Creating one...');
            
            const result = await pool.request()
                .query(`
                    INSERT INTO ProcenaRizika (pravnoLiceId, datum, status)
                    OUTPUT INSERTED.id
                    VALUES (1, GETDATE(), 'u_toku')
                `);
            
            const procenaId = result.recordset[0].id;
            console.log(`✅ Created new test procena with ID: ${procenaId}`);
            console.log(`🌐 Test URL: http://localhost:3000/optimized-risk/${procenaId}`);
        }
        
        await pool.close();
        console.log('\n🎉 Test completed! You can now visit the URL above to test the application.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testOptimizedFlow();