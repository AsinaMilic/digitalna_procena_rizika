import { NextRequest, NextResponse } from 'next/server';
import { PrilogMData, calculateStvarnaSteta, calculateVerovatnoMaksimalnaSteta } from '../../../../data/riskDataLoader';
import { getDbConnection } from '../../../../../lib/db';
import { ProcenaRouteContext } from '../../../types';

async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error as Error;
      const err = error as { code?: string; message: string };
      console.log(`Attempt ${attempt} failed:`, err.message);

      if (attempt < maxRetries && (err.code === 'ECONNCLOSED' || err.code === 'ENOTOPEN')) {
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(
  request: NextRequest,
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);
    const prilogMItem: PrilogMData = await request.json();

    // Validacija podataka
    if (!prilogMItem.id || !prilogMItem.groupId || prilogMItem.velicinaOpasnosti === null) {
      return NextResponse.json(
        { error: 'Nedostaju obavezni podaci' },
        { status: 400 }
      );
    }

    // Osnovna validacija podataka
    if (prilogMItem.velicinaOpasnosti && (prilogMItem.velicinaOpasnosti < 1 || prilogMItem.velicinaOpasnosti > 5)) {
      return NextResponse.json(
        { error: 'Veličina opasnosti mora biti između 1 i 5' },
        { status: 400 }
      );
    }

    await executeWithRetry(async () => {
      const pool = await getDbConnection();

      // Check if procena exists
      const procenaCheck = await pool.query('SELECT id FROM ProcenaRizika WHERE id = $1', [procenaId]);

      if (procenaCheck.rows.length === 0) {
        throw new Error("Procena ne postoji");
      }

      // Check if PrilogM record already exists
      const existingRecord = await pool.query('SELECT id FROM PrilogM WHERE procenaId = $1 AND itemId = $2 AND groupId = $3', [procenaId, prilogMItem.id, prilogMItem.groupId]);

      // Izračunaj dodatne vrednosti prema standardu
      const stepenSS = calculateStvarnaSteta(0, 1000000); // Default vrednosti - treba proširiti
      const { vmsh, stepenVMSH } = calculateVerovatnoMaksimalnaSteta(5000000, prilogMItem.velicinaOpasnosti || 3, 'default');

      if (existingRecord.rows.length > 0) {
        // Update existing record
        await pool.query(`
            UPDATE PrilogM SET
              requirement = $1,
              velicinaOpasnosti = $2,
              izlozenost = $3,
              ranjivost = $4,
              verovatnoca = $5,
              steta = $6,
              kriticnost = $7,
              posledice = $8,
              nivoRizika = $9,
              kategorijaRizika = $10,
              prihvatljivost = $11,
              stepenSS = $12,
              stepenVMSH = $13,
              vmshIznos = $14,
              opisIdentifikovanihRizika = $15,
              updatedAt = CURRENT_TIMESTAMP
            WHERE procenaId = $16 AND itemId = $17 AND groupId = $18
          `, [
          prilogMItem.requirement || '',
          prilogMItem.velicinaOpasnosti,
          prilogMItem.izlozenost,
          prilogMItem.ranjivost,
          prilogMItem.verovatnoca,
          prilogMItem.steta,
          prilogMItem.kriticnost,
          prilogMItem.posledice,
          prilogMItem.nivoRizika,
          prilogMItem.kategorijaRizika,
          prilogMItem.prihvatljivost,
          stepenSS,
          stepenVMSH,
          vmsh,
          prilogMItem.opisIdentifikovanihRizika || null,
          procenaId,
          prilogMItem.id,
          prilogMItem.groupId
        ]);
      } else {
        // Create new record
        await pool.query(`
            INSERT INTO PrilogM (
              procenaId, itemId, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
              verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost,
              stepenSS, stepenVMSH, vmshIznos, opisIdentifikovanihRizika, createdAt, updatedAt
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `, [
          procenaId,
          prilogMItem.id,
          prilogMItem.groupId,
          prilogMItem.requirement || '',
          prilogMItem.velicinaOpasnosti,
          prilogMItem.izlozenost,
          prilogMItem.ranjivost,
          prilogMItem.verovatnoca,
          prilogMItem.steta,
          prilogMItem.kriticnost,
          prilogMItem.posledice,
          prilogMItem.nivoRizika,
          prilogMItem.kategorijaRizika,
          prilogMItem.prihvatljivost,
          stepenSS,
          stepenVMSH,
          vmsh,
          prilogMItem.opisIdentifikovanihRizika || null
        ]);
      }
    });

    console.log(`✅ Prilog M podatak sačuvan za procenu ${procenaId}:`, {
      id: prilogMItem.id,
      velicinaOpasnosti: prilogMItem.velicinaOpasnosti,
      nivoRizika: prilogMItem.nivoRizika,
      prihvatljivost: prilogMItem.prihvatljivost
    });

    return NextResponse.json({
      success: true,
      message: 'Prilog M podatak uspešno sačuvan',
      data: prilogMItem
    });

  } catch (error: unknown) {
    console.error('Greška pri čuvanju Prilog M podatka:', error);
    const err = error as Error;

    if (err.message === "Procena ne postoji") {
      return NextResponse.json({ error: "Procena ne postoji" }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Greška pri čuvanju podataka' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const data = await executeWithRetry(async () => {
      const pool = await getDbConnection();

      // Postavi UTF-8 kodiranje za ovu sesiju
      await pool.query("SET client_encoding TO 'UTF8'");

      const result = await pool.query(`
          SELECT 
            itemId as id, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
            verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost,
            stepenSS, stepenVMSH, vmshIznos, opisIdentifikovanihRizika
          FROM PrilogM 
          WHERE procenaId = $1
          ORDER BY groupId, itemId
        `, [procenaId]);
      return result.rows;
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Greška pri učitavanju Prilog M podataka:', error);
    return NextResponse.json(
      { error: 'Greška pri učitavanju podataka' },
      { status: 500 }
    );
  }
}

// Endpoint za dobijanje agregiranih statistika
export async function PATCH(
  request: NextRequest,
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    const updateData = await request.json();

    if (!procenaId || !itemId) {
      return NextResponse.json({ error: 'Nedostaju obavezni parametri' }, { status: 400 });
    }

    // Validacija polja
    const allowedFields = ['posledice', 'steta', 'opisIdentifikovanihRizika'];
    const updateFields = Object.keys(updateData).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'Nema validnih polja za ažuriranje' }, { status: 400 });
    }

    // Validacija vrednosti
    for (const field of updateFields) {
      const value = updateData[field];
      if (field === 'opisIdentifikovanihRizika') {
        // Za opis, proveravamo da li je string
        if (typeof value !== 'string') {
          return NextResponse.json({
            error: `Vrednost za ${field} mora biti tekst`
          }, { status: 400 });
        }
      } else {
        // Za numerička polja (posledice, steta)
        if (typeof value !== 'number' || value < 1 || value > 5) {
          return NextResponse.json({
            error: `Vrednost za ${field} mora biti broj između 1 i 5`
          }, { status: 400 });
        }
      }
    }

    await executeWithRetry(async () => {
      const pool = await getDbConnection();

      // Proveri da li stavka postoji
      const existingRecord = await pool.query(
        'SELECT * FROM PrilogM WHERE procenaId = $1 AND itemId = $2',
        [procenaId, itemId]
      );

      if (existingRecord.rows.length === 0) {
        // Stavka ne postoji - ovo znači da rizik nije još uvek procenjen
        // Umesto da bacamo grešku, jednostavno ne radimo ništa za opisIdentifikovanihRizika
        if (updateFields.includes('opisIdentifikovanihRizika')) {
          console.log(`⚠️ Pokušaj ažuriranja opisa za nepostojećу stavku ${itemId} - preskačemo`);
          return; // Izađi iz funkcije bez greške
        } else {
          throw new Error('Stavka ne postoji');
        }
      } else {
        // Ako stavka postoji, ažuriraj je
        const setClause = updateFields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const values = [procenaId, itemId, ...updateFields.map(field => updateData[field])];

        const query = `
          UPDATE PrilogM 
          SET ${setClause}, updatedAt = CURRENT_TIMESTAMP
          WHERE procenaId = $1 AND itemId = $2
        `;

        await pool.query(query, values);
      }
    });

    console.log(`✅ Ažurirano polje/polja za stavku ${itemId}:`, updateData);

    return NextResponse.json({
      success: true,
      message: 'Stavka uspešno ažurirana',
      updatedFields: updateFields
    });

  } catch (error: unknown) {
    console.error('Greška pri ažuriranju stavke:', error);
    const err = error as Error;

    if (err.message === 'Stavka ne postoji') {
      return NextResponse.json({ error: 'Stavka ne postoji' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Greška pri ažuriranju stavke' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: ProcenaRouteContext
) {
  try {
    const { id } = await context.params;
    const procenaId = parseInt(id);

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const data = await executeWithRetry(async () => {
      const pool = await getDbConnection();
      const result = await pool.query(`
          SELECT 
            itemId as id, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
            verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost,
            stepenSS, stepenVMSH, vmshIznos, opisIdentifikovanihRizika
          FROM PrilogM 
          WHERE procenaId = $1
          ORDER BY groupId, itemId
        `, [procenaId]);
      return result.rows;
    });

    // Izračunaj statistike
    const totalItems = data.length;
    const riskCategories = {
      1: data.filter(item => item.kategorijaRizika === 1).length, // PRVA - izrazito veliki
      2: data.filter(item => item.kategorijaRizika === 2).length, // DRUGA - veliki
      3: data.filter(item => item.kategorijaRizika === 3).length, // TREĆA - umereno veliki
      4: data.filter(item => item.kategorijaRizika === 4).length, // ČETVRTA - mali
      5: data.filter(item => item.kategorijaRizika === 5).length  // PETA - vrlo mali
    };

    const prihvatljiviRizici = data.filter(item => item.prihvatljivost === 'PRIHVATLJIV').length;
    const neprihvatljiviRizici = data.filter(item => item.prihvatljivost === 'NEPRIHVATLJIV').length;

    const statistics = {
      totalItems,
      riskCategories,
      prihvatljiviRizici,
      neprihvatljiviRizici,
      completionPercentage: totalItems > 0 ? 100 : 0, // Ako imamo podatke, znači da je završeno
      highRiskItems: riskCategories[1] + riskCategories[2], // PRVA + DRUGA kategorija
      averageRiskLevel: totalItems > 0
        ? Math.round(data.reduce((sum, item) => sum + (item.nivoRizika || 0), 0) / totalItems * 100) / 100
        : 0
    };

    return NextResponse.json({
      data,
      statistics
    });

  } catch (error) {
    console.error('Greška pri računanju statistika:', error);
    return NextResponse.json(
      { error: 'Greška pri računanju statistika' },
      { status: 500 }
    );
  }
}