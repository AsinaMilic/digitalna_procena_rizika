const { createUsersTable, createRiskAssessmentTables } = require('../lib/db.ts');

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing database tables...');
        
        // Create users table first
        await createUsersTable();
        console.log('✅ Users table created/verified');
        
        // Create risk assessment tables
        await createRiskAssessmentTables();
        console.log('✅ Risk assessment tables created/verified');
        
        console.log('🎉 Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();