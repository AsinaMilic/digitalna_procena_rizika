import { NextRequest, NextResponse } from 'next/server';
import { PrilogMData } from '../../../../data/riskDataLoader';
import { getDbConnection } from '../../../../../lib/db';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);
    const prilogMItem: PrilogMData = await request.json();

    // Validacija podataka
    if (!prilogMItem.id || !prilogMItem.groupId || prilogMItem.velicinaOpasnosti === null) {
      return NextResponse.json(
        { error: 'Nedostaju obavezni podaci' },
        { status: 400 }
      );
    }

    await executeWithRetry(async () => {
      const pool = await getDbConnection();

      // Check if procena exists
      const procenaCheck = await pool.request()
        .input('procenaId', procenaId)
        .query('SELECT id FROM ProcenaRizika WHERE id = @procenaId');

      if (procenaCheck.recordset.length === 0) {
        throw new Error("Procena ne postoji");
      }

      // Check if PrilogM record already exists
      const existingRecord = await pool.request()
        .input('procenaId', procenaId)
        .input('itemId', prilogMItem.id)
        .input('groupId', prilogMItem.groupId)
        .query('SELECT id FROM PrilogM WHERE procenaId = @procenaId AND itemId = @itemId AND groupId = @groupId');

      if (existingRecord.recordset.length > 0) {
        // Update existing record
        await pool.request()
          .input('procenaId', procenaId)
          .input('itemId', prilogMItem.id)
          .input('groupId', prilogMItem.groupId)
          .input('requirement', prilogMItem.requirement || '')
          .input('velicinaOpasnosti', prilogMItem.velicinaOpasnosti)
          .input('izlozenost', prilogMItem.izlozenost)
          .input('ranjivost', prilogMItem.ranjivost)
          .input('verovatnoca', prilogMItem.verovatnoca)
          .input('steta', prilogMItem.steta)
          .input('kriticnost', prilogMItem.kriticnost)
          .input('posledice', prilogMItem.posledice)
          .input('nivoRizika', prilogMItem.nivoRizika)
          .input('kategorijaRizika', prilogMItem.kategorijaRizika)
          .input('prihvatljivost', prilogMItem.prihvatljivost)
          .query(`
            UPDATE PrilogM SET
              requirement = @requirement,
              velicinaOpasnosti = @velicinaOpasnosti,
              izlozenost = @izlozenost,
              ranjivost = @ranjivost,
              verovatnoca = @verovatnoca,
              steta = @steta,
              kriticnost = @kriticnost,
              posledice = @posledice,
              nivoRizika = @nivoRizika,
              kategorijaRizika = @kategorijaRizika,
              prihvatljivost = @prihvatljivost,
              updatedAt = GETDATE()
            WHERE procenaId = @procenaId AND itemId = @itemId AND groupId = @groupId
          `);
      } else {
        // Create new record
        await pool.request()
          .input('procenaId', procenaId)
          .input('itemId', prilogMItem.id)
          .input('groupId', prilogMItem.groupId)
          .input('requirement', prilogMItem.requirement || '')
          .input('velicinaOpasnosti', prilogMItem.velicinaOpasnosti)
          .input('izlozenost', prilogMItem.izlozenost)
          .input('ranjivost', prilogMItem.ranjivost)
          .input('verovatnoca', prilogMItem.verovatnoca)
          .input('steta', prilogMItem.steta)
          .input('kriticnost', prilogMItem.kriticnost)
          .input('posledice', prilogMItem.posledice)
          .input('nivoRizika', prilogMItem.nivoRizika)
          .input('kategorijaRizika', prilogMItem.kategorijaRizika)
          .input('prihvatljivost', prilogMItem.prihvatljivost)
          .query(`
            INSERT INTO PrilogM (
              procenaId, itemId, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
              verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost,
              createdAt, updatedAt
            ) VALUES (
              @procenaId, @itemId, @groupId, @requirement, @velicinaOpasnosti, @izlozenost, @ranjivost,
              @verovatnoca, @steta, @kriticnost, @posledice, @nivoRizika, @kategorijaRizika, @prihvatljivost,
              GETDATE(), GETDATE()
            )
          `);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const data = await executeWithRetry(async () => {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('procenaId', procenaId)
        .query(`
          SELECT 
            itemId as id, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
            verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost
          FROM PrilogM 
          WHERE procenaId = @procenaId
          ORDER BY groupId, itemId
        `);
      return result.recordset;
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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procenaId = parseInt(id);

    if (!procenaId) {
      return NextResponse.json({ error: 'Nevaljan ID procene' }, { status: 400 });
    }

    const data = await executeWithRetry(async () => {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('procenaId', procenaId)
        .query(`
          SELECT 
            itemId as id, groupId, requirement, velicinaOpasnosti, izlozenost, ranjivost,
            verovatnoca, steta, kriticnost, posledice, nivoRizika, kategorijaRizika, prihvatljivost
          FROM PrilogM 
          WHERE procenaId = @procenaId
          ORDER BY groupId, itemId
        `);
      return result.recordset;
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