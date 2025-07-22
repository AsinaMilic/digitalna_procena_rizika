import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    const pool = await getDbConnection();
    
    // Učitaj SQL skriptu
    const sqlPath = join(process.cwd(), 'database', 'add_prilog_m_columns.sql');
    const sqlScript = readFileSync(sqlPath, 'utf8');
    
    console.log('🔧 Izvršavam ažuriranje PrilogM tabele...');
    
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
    
    return NextResponse.json({
      success: true,
      message: 'PrilogM tabela uspešno ažurirana',
      tableStructure: structureResult.rows
    });
    
  } catch (error) {
    console.error('❌ Greška pri ažuriranju PrilogM tabele:', error);
    const err = error as Error;
    
    return NextResponse.json({
      success: false,
      error: 'Greška pri ažuriranju tabele',
      details: err.message
    }, { status: 500 });
  }
}