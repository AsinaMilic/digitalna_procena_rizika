import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';
import { ProcenaRouteContext } from '../../../types';

// GET - Učitaj sekcijske podatke za Prilog M
export async function GET(
  request: NextRequest,
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);

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
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);

    if (isNaN(procenaId)) {
      return NextResponse.json(
        { error: 'Nevaljan ID procene' },
        { status: 400 }
      );
    }

    const { sections, summary } = await request.json();
    const pool = await getDbConnection();

    try {
      // Ažuriraj sekcijske podatke (Azure SQL MERGE pattern)
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          // Check if exists
          const existsResult = await pool.query(`
            SELECT id FROM PrilogMSections 
            WHERE procenaId = $1 AND sectionNumber = $2
          `, [procenaId, section.sectionNumber]);

          if (existsResult.rows.length > 0) {
            // Update
            await pool.query(`
              UPDATE PrilogMSections SET
                sectionTitle = $1,
                totalItems = $2,
                completedItems = $3,
                averageVO = $4,
                averageIzlozenost = $5,
                averageRanjivost = $6,
                averageVerovatnoca = $7,
                averagePosledice = $8,
                averageSteta = $9,
                averageKriticnost = $10,
                averageNivoRizika = $11,
                dominantnaKategorija = $12,
                prihvatljivostStatus = $13,
                updatedAt = GETDATE()
              WHERE procenaId = $14 AND sectionNumber = $15
            `, [
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
              section.prihvatljivostStatus || null,
              procenaId,
              section.sectionNumber
            ]);
          } else {
            // Insert
            await pool.query(`
              INSERT INTO PrilogMSections (
                procenaId, sectionNumber, sectionTitle, totalItems, completedItems,
                averageVO, averageIzlozenost, averageRanjivost, averageVerovatnoca,
                averagePosledice, averageSteta, averageKriticnost, averageNivoRizika,
                dominantnaKategorija, prihvatljivostStatus, createdAt, updatedAt
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, GETDATE(), GETDATE())
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
      }

      // Ažuriraj ukupne podatke
      if (summary) {
        const summaryExists = await pool.query(`
          SELECT id FROM PrilogMSummary WHERE procenaId = $1
        `, [procenaId]);

        if (summaryExists.rows.length > 0) {
          // Update
          await pool.query(`
            UPDATE PrilogMSummary SET
              ukupnoStavki = $1,
              ukupnoZavrsenih = $2,
              ukupanNivoRizika = $3,
              ukupnaKategorija = $4,
              ukupnaPrihvatljivost = $5,
              procenatZavrsenosti = $6,
              preporuke = $7,
              updatedAt = GETDATE()
            WHERE procenaId = $8
          `, [
            summary.ukupnoStavki || 0,
            summary.ukupnoZavrsenih || 0,
            summary.ukupanNivoRizika || null,
            summary.ukupnaKategorija || null,
            summary.ukupnaPrihvatljivost || null,
            summary.procenatZavrsenosti || null,
            summary.preporuke || null,
            procenaId
          ]);
        } else {
          // Insert
          await pool.query(`
            INSERT INTO PrilogMSummary (
              procenaId, ukupnoStavki, ukupnoZavrsenih, ukupanNivoRizika,
              ukupnaKategorija, ukupnaPrihvatljivost, procenatZavrsenosti,
              preporuke, createdAt, updatedAt
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, GETDATE(), GETDATE())
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
      }

      return NextResponse.json({
        success: true,
        message: 'Sekcijski podaci uspešno sačuvani'
      });

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Greška pri čuvanju sekcijskih podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri čuvanju podataka' },
      { status: 500 }
    );
  }
}
