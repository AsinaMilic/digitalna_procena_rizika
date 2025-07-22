import { config } from 'dotenv';
import { createUsersTable, createRiskAssessmentTables } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Xata PostgreSQL database...');
        console.log('🔗 Connection string:', process.env.DATABASE_URL_POSTGRES ? 'Found' : 'Missing');
        
        console.log('📋 Creating users table...');
        await createUsersTable();
        
        console.log('📋 Creating risk assessment tables...');
        await createRiskAssessmentTables();
        
        console.log('✅ Database initialization completed successfully!');
        console.log('🔑 Default admin user created:');
        console.log('   Email: admin@admin.com');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.error('Connection string exists:', !!process.env.DATABASE_URL_POSTGRES);
        process.exit(1);
    }
}

initializeDatabase();