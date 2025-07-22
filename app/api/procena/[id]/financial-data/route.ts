import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';

interface FinancialData {
  poslovniPrihodi: number;
  vrednostImovine: number;
  delatnost: string;
  stvarnaSteta: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);
    const financialData: FinancialData = await request.json();

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const pool = await getDbConnection();

    // Proveri da li procena postoji
    const procenaCheck = await pool.query('SELECT id FROM ProcenaRizika WHERE id = $1', [procenaId]);
    if (procenaCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Procena ne postoji' }, { status: 404 });
    }

    // Ažuriraj sve postojeće PrilogM zapise sa novim finansijskim podacima
    await pool.query(`
      UPDATE PrilogM SET
        poslovniPrihodi = $1,
        vrednostImovine = $2,
        delatnost = $3,
        stvarnaSteta = $4,
        updatedAt = CURRENT_TIMESTAMP
      WHERE procenaId = $5
    `, [
      financialData.poslovniPrihodi,
      financialData.vrednostImovine,
      financialData.delatnost,
      financialData.stvarnaSteta,
      procenaId
    ]);

    console.log(`✅ Finansijski podaci ažurirani za procenu ${procenaId}`);

    return NextResponse.json({
      success: true,
      message: 'Finansijski podaci uspešno sačuvani',
      data: financialData
    });

  } catch (error) {
    console.error('Greška pri čuvanju finansijskih podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri čuvanju podataka' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const pool = await getDbConnection();

    // Uzmi finansijske podatke iz bilo kog PrilogM zapisa (svi imaju iste)
    const result = await pool.query(`
      SELECT DISTINCT poslovniPrihodi, vrednostImovine, delatnost, stvarnaSteta
      FROM PrilogM 
      WHERE procenaId = $1
      LIMIT 1
    `, [procenaId]);

    if (result.rows.length === 0) {
      // Vrati default vrednosti ako nema podataka
      return NextResponse.json({
        poslovniPrihodi: 1000000,
        vrednostImovine: 5000000,
        delatnost: 'default',
        stvarnaSteta: 0
      });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Greška pri učitavanju finansijskih podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri učitavanju podataka' },
      { status: 500 }
    );
  }
}