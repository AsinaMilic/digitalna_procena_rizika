import sql from 'mssql';

const config: sql.config = {
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    server: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    connectionTimeout: 60000,
    requestTimeout: 60000,
};

let pool: sql.ConnectionPool | null = null;

export async function getDbConnection() {
    if (!pool || !pool.connected) {
        if (pool) {
            try {
                await pool.close();
            } catch (error) {
                console.log('Error closing existing pool:', error);
            }
        }
        
        pool = new sql.ConnectionPool(config);
        
        pool.on('error', (err) => {
            console.error('Database pool error:', err);
            pool = null;
        });
        
        await pool.connect();
    }
    return pool;
}

// Kreiranje tabele korisnika sa statusom i automatski admin ako ne postoji
export async function createUsersTable() {
    const pool = await getDbConnection();

    // Kreiranje tabele korisnika
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='korisnici' AND xtype='U')
      CREATE TABLE korisnici (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        lozinka NVARCHAR(255) NOT NULL,
        ime NVARCHAR(100) NOT NULL,
        prezime NVARCHAR(100) NOT NULL,
        status NVARCHAR(20) DEFAULT 'na_cekanju' NOT NULL,
        je_admin BIT DEFAULT 0,
        datum_kreiranja DATETIME DEFAULT GETDATE(),
        datum_odobrenja DATETIME NULL,
        odobrio_admin INT NULL
      )
    `);

    // Proverava da li postoji admin
    const adminExists = await pool.request().query(`
      SELECT COUNT(*) as count FROM korisnici WHERE je_admin = 1
    `);
    if (adminExists.recordset[0].count === 0) {
        const bcrypt = await import('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 10);
        await pool.request().query(`
        INSERT INTO korisnici (email, lozinka, ime, prezime, status, je_admin)
        VALUES ('admin@admin.com', '${adminPassword}', 'Admin', 'Administrator', 'odobren', 1)
      `);
    }
}

// Kreiranje tabela za procenu rizika
export async function createRiskAssessmentTables() {
    const pool = await getDbConnection();

    // Kreiranje tabele ProcenaRizika
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProcenaRizika' AND xtype='U')
      CREATE TABLE ProcenaRizika (
        id INT IDENTITY(1,1) PRIMARY KEY,
        naziv NVARCHAR(255) NOT NULL,
        opis NVARCHAR(MAX),
        korisnikId INT,
        pravnoLiceId INT,
        status NVARCHAR(50) DEFAULT 'u_toku',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (korisnikId) REFERENCES korisnici(id)
      )
    `);

    // Kreiranje tabele RiskSelection
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RiskSelection' AND xtype='U')
      CREATE TABLE RiskSelection (
        id INT IDENTITY(1,1) PRIMARY KEY,
        procenaId INT NOT NULL,
        riskId NVARCHAR(50) NOT NULL,
        dangerLevel INT NOT NULL,
        description NVARCHAR(MAX),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        UNIQUE(procenaId, riskId)
      )
    `);

    // Kreiranje tabele PrilogM
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PrilogM' AND xtype='U')
      CREATE TABLE PrilogM (
        id INT IDENTITY(1,1) PRIMARY KEY,
        procenaId INT NOT NULL,
        itemId NVARCHAR(50) NOT NULL,
        groupId NVARCHAR(50) NOT NULL,
        requirement NVARCHAR(MAX),
        velicinaOpasnosti INT,
        izlozenost INT,
        ranjivost INT,
        verovatnoca INT,
        steta INT,
        kriticnost INT,
        posledice INT,
        nivoRizika INT,
        kategorijaRizika INT,
        prihvatljivost NVARCHAR(50),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
        UNIQUE(procenaId, itemId, groupId)
      )
    `);

    // Kreiranje tabele PravnoLice
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PravnoLice' AND xtype='U')
      CREATE TABLE PravnoLice (
        id INT IDENTITY(1,1) PRIMARY KEY,
        naziv NVARCHAR(255) NOT NULL,
        pib NVARCHAR(20) UNIQUE NOT NULL,
        adresa NVARCHAR(500),
        telefon NVARCHAR(50),
        email NVARCHAR(255),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    console.log('✅ Risk assessment tables created successfully');
}
