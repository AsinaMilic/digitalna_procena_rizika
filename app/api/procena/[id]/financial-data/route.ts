import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);
    const financialData = await request.json();

    const pool = await getDbConnection();

    // Proveri da li procena postoji
    const procenaCheck = await pool.query('SELECT id FROM ProcenaRizika WHERE id = $1', [procenaId]);
    if (procenaCheck.rows.length === 0) {
      return NextResponse.json({ error: "Procena ne postoji" }, { status: 404 });
    }

    // Upsert finansijskih podataka
    await pool.query(`
      INSERT INTO FinancialData (procenaId, poslovniPrihodi, vrednostImovine, delatnost, stvarnaSteta, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (procenaId) 
      DO UPDATE SET 
        poslovniPrihodi = EXCLUDED.poslovniPrihodi,
        vrednostImovine = EXCLUDED.vrednostImovine,
        delatnost = EXCLUDED.delatnost,
        stvarnaSteta = EXCLUDED.stvarnaSteta,
        updatedAt = CURRENT_TIMESTAMP
    `, [
      procenaId,
      financialData.poslovniPrihodi,
      financialData.vrednostImovine,
      financialData.delatnost,
      financialData.stvarnaSteta
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Greška pri čuvanju finansijskih podataka:', error);
    return NextResponse.json({ error: 'Greška pri čuvanju podataka' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);

    const pool = await getDbConnection();
    
    const result = await pool.query(`
      SELECT poslovniPrihodi, vrednostImovine, delatnost, stvarnaSteta
      FROM FinancialData 
      WHERE procenaId = $1
    `, [procenaId]);

    if (result.rows.length === 0) {
      // Vrati prazne vrednosti ako nema podataka
      return NextResponse.json({
        poslovniPrihodi: 0,
        vrednostImovine: 0,
        delatnost: 'default',
        stvarnaSteta: 0
      });
    }

    // PostgreSQL vraća nazive kolona u malim slovima
    const data = result.rows[0];
    return NextResponse.json({
      poslovniPrihodi: parseInt(data.poslovniprihodi || '0'),
      vrednostImovine: parseInt(data.vrednostimovine || '0'),
      delatnost: data.delatnost || 'default',
      stvarnaSteta: parseInt(data.stvarnasteta || '0')
    });

  } catch (error) {
    console.error('Greška pri učitavanju finansijskih podataka:', error);
    return NextResponse.json({ error: 'Greška pri učitavanju podataka' }, { status: 500 });
  }
}