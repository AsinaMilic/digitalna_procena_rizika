import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';

// GET - Učitaj sekcijske podatke za Prilog M
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const procenaId = parseInt(params.id);
    
    if (isNaN(procenaId)) {
      return NextResponse.json(
        { error: 'Nevaljan ID procene' },
        { status: 400 }
      );
    }

    const pool = await getDbConnection();

    // Učitaj sekcijske podatke
    const sectionsResult = await pool.query(`
      SELECT * FROM PrilogMSections 
      WHERE procenaId = $1 
      ORDER BY sectionNumber
    `, [procenaId]);

    // Učitaj ukupne podatke
    const summaryResult = await pool.query(`
      SELECT * FROM PrilogMSummary 
      WHERE procenaId = $1
    `, [procenaId]);

    return NextResponse.json({
      sections: sectionsResult.rows,
      summary: summaryResult.rows[0] || null
    });

  } catch (error) {
    console.error('Greška pri učitavanju sekcijskih podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri učitavanju podataka' },
      { status: 500 }
    );
  }
}

// POST - Sačuvaj ili ažuriraj sekcijske podatke
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const procenaId = parseInt(params.id);
    
    if (isNaN(procenaId)) {
      return NextResponse.json(
        { error: 'Nevaljan ID procene' },
        { status: 400 }
      );
    }

    const { sections, summary } = await request.json();
    const pool = await getDbConnection();

    // Počni transakciju
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Ažuriraj sekcijske podatke
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          await client.query(`
            INSERT INTO PrilogMSections (
              procenaId, sectionNumber, sectionTitle, totalItems, completedItems,
              averageVO, averageIzlozenost, averageRanjivost, averageVerovatnoca,
              averagePosledice, averageSteta, averageKriticnost, averageNivoRizika,
              dominantnaKategorija, prihvatljivostStatus, updatedAt
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
            ON CONFLICT (procenaId, sectionNumber) 
            DO UPDATE SET
              sectionTitle = EXCLUDED.sectionTitle,
              totalItems = EXCLUDED.totalItems,
              completedItems = EXCLUDED.completedItems,
              averageVO = EXCLUDED.averageVO,
              averageIzlozenost = EXCLUDED.averageIzlozenost,
              averageRanjivost = EXCLUDED.averageRanjivost,
              averageVerovatnoca = EXCLUDED.averageVerovatnoca,
              averagePosledice = EXCLUDED.averagePosledice,
              averageSteta = EXCLUDED.averageSteta,
              averageKriticnost = EXCLUDED.averageKriticnost,
              averageNivoRizika = EXCLUDED.averageNivoRizika,
              dominantnaKategorija = EXCLUDED.dominantnaKategorija,
              prihvatljivostStatus = EXCLUDED.prihvatljivostStatus,
              updatedAt = CURRENT_TIMESTAMP
          `, [
            procenaId,
            section.sectionNumber,
            section.sectionTitle,
            section.totalItems || 0,
            section.completedItems || 0,
            section.averageVO || null,
            section.averageIzlozenost || null,
            section.averageRanjivost || null,
            section.averageVerovatnoca || null,
            section.averagePosledice || null,
            section.averageSteta || null,
            section.averageKriticnost || null,
            section.averageNivoRizika || null,
            section.dominantnaKategorija || null,
            section.prihvatljivostStatus || null
          ]);
        }
      }

      // Ažuriraj ukupne podatke
      if (summary) {
        await client.query(`
          INSERT INTO PrilogMSummary (
            procenaId, ukupnoStavki, ukupnoZavrsenih, ukupanNivoRizika,
            ukupnaKategorija, ukupnaPrihvatljivost, procenatZavrsenosti,
            preporuke, updatedAt
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (procenaId) 
          DO UPDATE SET
            ukupnoStavki = EXCLUDED.ukupnoStavki,
            ukupnoZavrsenih = EXCLUDED.ukupnoZavrsenih,
            ukupanNivoRizika = EXCLUDED.ukupanNivoRizika,
            ukupnaKategorija = EXCLUDED.ukupnaKategorija,
            ukupnaPrihvatljivost = EXCLUDED.ukupnaPrihvatljivost,
            procenatZavrsenosti = EXCLUDED.procenatZavrsenosti,
            preporuke = EXCLUDED.preporuke,
            updatedAt = CURRENT_TIMESTAMP
        `, [
          procenaId,
          summary.ukupnoStavki || 0,
          summary.ukupnoZavrsenih || 0,
          summary.ukupanNivoRizika || null,
          summary.ukupnaKategorija || null,
          summary.ukupnaPrihvatljivost || null,
          summary.procenatZavrsenosti || null,
          summary.preporuke || null
        ]);
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Sekcijski podaci uspešno sačuvani'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Greška pri čuvanju sekcijskih podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri čuvanju podataka' },
      { status: 500 }
    );
  }
}