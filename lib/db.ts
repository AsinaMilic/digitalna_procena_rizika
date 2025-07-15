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
};

let pool: sql.ConnectionPool | null = null;

export async function getDbConnection() {
    if (!pool) {
        pool = new sql.ConnectionPool(config);
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
