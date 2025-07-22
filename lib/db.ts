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

// Kreiranje tabela za procenu rizika
export async function createRiskAssessmentTables() {
  const pool = await getDbConnection();

  // Kreiranje tabele PravnoLice prvo (jer je referisana od strane ProcenaRizika)
  await pool.query(`
      CREATE TABLE IF NOT EXISTS PravnoLice (
        id SERIAL PRIMARY KEY,
        naziv VARCHAR(255) NOT NULL,
        pib VARCHAR(20) UNIQUE NOT NULL,
        adresa VARCHAR(500),
        telefon VARCHAR(50),
        email VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

  // Kreiranje tabele ProcenaRizika
  await pool.query(`
      CREATE TABLE IF NOT EXISTS ProcenaRizika (
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
      CREATE TABLE IF NOT EXISTS RiskSelection (
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
      CREATE TABLE IF NOT EXISTS PrilogM (
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
        -- Dodatni podaci za kalkulacije prema standardu
        stepenIzlozenosti INTEGER DEFAULT 3,
        stepenRanjivosti INTEGER DEFAULT 3,
        stvarnaSteta DECIMAL(15,2) DEFAULT 0,
        poslovniPrihodi DECIMAL(15,2) DEFAULT 1000000,
        vrednostImovine DECIMAL(15,2) DEFAULT 5000000,
        delatnost VARCHAR(100) DEFAULT 'default',
        -- Kalkulisane vrednosti
        stepenSS INTEGER,
        stepenVMSH INTEGER,
        vmshIznos DECIMAL(15,2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        UNIQUE(procenaId, itemId, groupId)
      )
    `);

  console.log('✅ Risk assessment tables created successfully');
}
