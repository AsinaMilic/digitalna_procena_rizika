import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getDbConnection() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL_POSTGRES;

    if (!connectionString) {
      throw new Error('DATABASE_URL_POSTGRES environment variable is not set');
    }

    // Connection established to Xata PostgreSQL

    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000,
    });

    // Postavi UTF-8 kodiranje za sve konekcije
    pool.on('connect', async (client) => {
      try {
        await client.query("SET client_encoding TO 'UTF8'");
      } catch (err) {
        console.error('Error setting client encoding:', err);
      }
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  return pool;
}

// Kreiranje tabele korisnika sa statusom i automatski admin ako ne postoji
export async function createUsersTable() {
  const pool = await getDbConnection();

  // Kreiranje tabele korisnika
  await pool.query(`
      CREATE TABLE IF NOT EXISTS korisnici (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        lozinka VARCHAR(255) NOT NULL,
        ime VARCHAR(100) NOT NULL,
        prezime VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'na_cekanju' NOT NULL,
        je_admin BOOLEAN DEFAULT FALSE,
        datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        datum_odobrenja TIMESTAMP NULL,
        odobrio_admin INTEGER NULL
      )
    `);

  // Proverava da li postoji admin
  const adminExists = await pool.query(`
      SELECT COUNT(*) as count FROM korisnici WHERE je_admin = TRUE
    `);
  if (parseInt(adminExists.rows[0].count) === 0) {
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
        INSERT INTO korisnici (email, lozinka, ime, prezime, status, je_admin)
        VALUES ('admin@admin.com', $1, 'Admin', 'Administrator', 'odobren', TRUE)
      `, [adminPassword]);
  }
}

// Kreiranje kompletne šeme baze podataka - briše postojeće podatke!
export async function initializeDatabase() {
  const pool = await getDbConnection();

  try {
    console.log('🗑️ Dropping existing schema...');

    // Obriši sve tabele i sekvence kompletno
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO postgres');
    await pool.query('GRANT ALL ON SCHEMA public TO public');

    console.log('🏗️ Creating fresh database schema...');

    // Kreiranje tabele korisnika
    await pool.query(`
      CREATE TABLE korisnici (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        lozinka VARCHAR(255) NOT NULL,
        ime VARCHAR(100) NOT NULL,
        prezime VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'na_cekanju' NOT NULL,
        je_admin BOOLEAN DEFAULT FALSE,
        datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        datum_odobrenja TIMESTAMP NULL,
        odobrio_admin INTEGER NULL
      )
    `);

    // Kreiranje tabele PravnoLice
    await pool.query(`
      CREATE TABLE PravnoLice (
        id SERIAL PRIMARY KEY,
        naziv VARCHAR(255) NOT NULL,
        skraceno_poslovno_ime VARCHAR(255),
        pib VARCHAR(20) UNIQUE NOT NULL,
        maticni_broj VARCHAR(20),
        adresa VARCHAR(500),
        adresa_sediste VARCHAR(500),
        adresa_ostala TEXT,
        sifra_delatnosti VARCHAR(20),
        lice_zastupanje TEXT,
        lice_komunikacija TEXT,
        tim_procena_rizika TEXT,
        telefon VARCHAR(50),
        telefon_faks VARCHAR(100),
        email VARCHAR(255),
        internet_adresa VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kreiranje tabele Usluge
    await pool.query(`
      CREATE TABLE Usluge (
        id SERIAL PRIMARY KEY,
        pravnoLiceId INTEGER NOT NULL REFERENCES PravnoLice(id) ON DELETE CASCADE,
        naziv_usluge TEXT NOT NULL,
        datum_izrade DATE,
        opis TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kreiranje tabele ProcenaRizika
    await pool.query(`
      CREATE TABLE ProcenaRizika (
        id SERIAL PRIMARY KEY,
        naziv VARCHAR(255) NOT NULL,
        opis TEXT,
        korisnikId INTEGER,
        pravnoLiceId INTEGER,
        status VARCHAR(50) DEFAULT 'u_toku',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (korisnikId) REFERENCES korisnici(id),
        FOREIGN KEY (pravnoLiceId) REFERENCES PravnoLice(id)
      )
    `);

    // Kreiranje tabele RiskSelection
    await pool.query(`
      CREATE TABLE RiskSelection (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL,
        riskId VARCHAR(50) NOT NULL,
        dangerLevel INTEGER NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        UNIQUE(procenaId, riskId)
      )
    `);

    // Kreiranje tabele PrilogM
    await pool.query(`
      CREATE TABLE PrilogM (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL,
        itemId VARCHAR(50) NOT NULL,
        groupId VARCHAR(50) NOT NULL,
        requirement TEXT,
        velicinaOpasnosti INTEGER,
        izlozenost INTEGER,
        ranjivost INTEGER,
        verovatnoca INTEGER,
        steta INTEGER,
        kriticnost INTEGER,
        posledice INTEGER,
        nivoRizika INTEGER,
        kategorijaRizika INTEGER,
        prihvatljivost VARCHAR(50),
        stepenIzlozenosti INTEGER DEFAULT 3,
        stepenRanjivosti INTEGER DEFAULT 3,
        stvarnaSteta DECIMAL(15,2) DEFAULT 0,
        poslovniPrihodi DECIMAL(15,2) DEFAULT 1000000,
        vrednostImovine DECIMAL(15,2) DEFAULT 5000000,
        delatnost VARCHAR(100) DEFAULT 'default',
        stepenSS INTEGER,
        stepenVMSH INTEGER,
        vmshIznos DECIMAL(15,2),
        opisIdentifikovanihRizika TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        UNIQUE(procenaId, itemId, groupId)
      )
    `);

    // Kreiranje tabele FinancialData
    await pool.query(`
      CREATE TABLE FinancialData (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        poslovniPrihodi BIGINT NOT NULL DEFAULT 1000000,
        vrednostImovine BIGINT NOT NULL DEFAULT 5000000,
        delatnost VARCHAR(100) NOT NULL DEFAULT 'default',
        stvarnaSteta BIGINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procenaId)
      )
    `);

    // Kreiranje tabele PrilogLj - za sekcijske opise identifikovanih rizika
    await pool.query(`
      CREATE TABLE PrilogLj (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        sectionId VARCHAR(50) NOT NULL,
        groupId VARCHAR(50) NOT NULL,
        sectionName VARCHAR(255),
        itemCount INTEGER DEFAULT 0,
        averageVO INTEGER,
        opisIdentifikovanihRizika TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procenaId, sectionId, groupId)
      )
    `);

    // Kreiranje tabele PrilogMSections - za sekcijske podatke u Prilog M
    await pool.query(`
      CREATE TABLE PrilogMSections (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        sectionNumber INTEGER NOT NULL,
        sectionTitle VARCHAR(255) NOT NULL,
        totalItems INTEGER DEFAULT 0,
        completedItems INTEGER DEFAULT 0,
        averageVO DECIMAL(3,2),
        averageIzlozenost DECIMAL(3,2),
        averageRanjivost DECIMAL(3,2),
        averageVerovatnoca DECIMAL(3,2),
        averagePosledice DECIMAL(3,2),
        averageSteta DECIMAL(3,2),
        averageKriticnost DECIMAL(3,2),
        averageNivoRizika DECIMAL(5,2),
        dominantnaKategorija INTEGER,
        prihvatljivostStatus VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procenaId, sectionNumber)
      )
    `);

    // Kreiranje tabele PrilogMSummary - za ukupne podatke na dnu Prilog M
    await pool.query(`
      CREATE TABLE PrilogMSummary (
        id SERIAL PRIMARY KEY,
        procenaId INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        ukupnoStavki INTEGER DEFAULT 0,
        ukupnoZavrsenih INTEGER DEFAULT 0,
        ukupanNivoRizika DECIMAL(5,2),
        ukupnaKategorija INTEGER,
        ukupnaPrihvatljivost VARCHAR(50),
        procenatZavrsenosti DECIMAL(5,2),
        preporuke TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procenaId)
      )
    `);

    // Kreiranje tabele PrilogS - karakteristike identifikovanih rizika
    await pool.query(`
      CREATE TABLE prilog_s (
        id SERIAL PRIMARY KEY,
        procena_id INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        vrednost TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procena_id, group_id, item_id)
      )
    `);

    // Kreiranje tabele TabelaF5 - mere za postupanje sa rizicima
    await pool.query(`
      CREATE TABLE tabela_f5 (
        id SERIAL PRIMARY KEY,
        procena_id INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        item_id INTEGER NOT NULL,
        mera TEXT,
        opis_i_obrazlozenje TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procena_id, item_id)
      )
    `);

    // Kreiranje tabele PrilogB1 - Uticaj delatnosti
    await pool.query(`
      CREATE TABLE prilog_b1 (
        id SERIAL PRIMARY KEY,
        procena_id INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL,
        uticaj DECIMAL(5,2) DEFAULT 0,
        iud DECIMAL(5,4),
        vk INTEGER,
        k INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procena_id, group_id)
      )
    `);

    // Kreiranje tabele PrilogT - Ocena resursa
    await pool.query(`
      CREATE TABLE prilog_t (
        id SERIAL PRIMARY KEY,
        procena_id INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        kapital_score INTEGER,
        menadzeri_score INTEGER,
        osiguranje_score INTEGER,
        registar_score INTEGER,
        zarada_score INTEGER,
        prosek_resursa DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(procena_id)
      )
    `);

    // Kreiranje indeksa
    await pool.query(`
      CREATE INDEX idx_pravno_lice_maticni_broj ON PravnoLice(maticni_broj);
      CREATE INDEX idx_pravno_lice_pib ON PravnoLice(pib);
      CREATE INDEX idx_pravno_lice_sifra_delatnosti ON PravnoLice(sifra_delatnosti);
      CREATE INDEX idx_financial_data_procena ON FinancialData(procenaId);
    `);

    // Kreiranje default admin korisnika
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO korisnici (email, lozinka, ime, prezime, status, je_admin)
      VALUES ('admin@admin.com', $1, 'Admin', 'Administrator', 'odobren', TRUE)
    `, [adminPassword]);

    console.log('✅ Database schema initialized successfully');
    console.log('👤 Default admin created: admin@admin.com / admin123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Kreiranje tabela za procenu rizika (backward compatibility)
export async function createRiskAssessmentTables() {
  return initializeDatabase();
}


