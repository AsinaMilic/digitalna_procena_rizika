# Database Schema Documentation

This document describes the database schema for the Digital Risk Assessment application.

## Tables

### PravnoLice (Legal Entity)
```sql
CREATE TABLE PravnoLice (
    id INT IDENTITY(1,1) PRIMARY KEY,
    naziv NVARCHAR(255) NOT NULL,
    pib NVARCHAR(50) NOT NULL,
    adresa NVARCHAR(500) NULL
);
```

### ProcenaRizika (Risk Assessment)
```sql
CREATE TABLE ProcenaRizika (
    id INT IDENTITY(1,1) PRIMARY KEY,
    pravnoLiceId INT NOT NULL,
    datum DATETIME DEFAULT GETDATE(),
    status NVARCHAR(50) DEFAULT 'u_toku',
    FOREIGN KEY (pravnoLiceId) REFERENCES PravnoLice(id)
);
```

### GrupaRizika (Risk Group)
```sql
CREATE TABLE GrupaRizika (
    id INT IDENTITY(1,1) PRIMARY KEY,
    naziv NVARCHAR(255) NOT NULL,
    redosled INT NOT NULL
);
```

### UnosRizika (Risk Input)
```sql
CREATE TABLE UnosRizika (
    id INT IDENTITY(1,1) PRIMARY KEY,
    procenaId INT NOT NULL,
    grupaId INT NOT NULL,
    polje NVARCHAR(100) NOT NULL,
    vrednost NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id),
    FOREIGN KEY (grupaId) REFERENCES GrupaRizika(id)
);
```

### RiskSelection (Risk Selection)
```sql
CREATE TABLE RiskSelection (
    id INT IDENTITY(1,1) PRIMARY KEY,
    procenaId INT NOT NULL,
    riskId NVARCHAR(100) NOT NULL,
    dangerLevel INT NOT NULL,
    description NVARCHAR(MAX) DEFAULT '',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id),
    UNIQUE (procenaId, riskId)
);
```

### RiskRegister (Risk Register)
```sql
CREATE TABLE RiskRegister (
    id INT IDENTITY(1,1) PRIMARY KEY,
    procenaId INT NOT NULL,
    riskId NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    dangerLevel INT NOT NULL,
    exposure INT NOT NULL,
    vulnerability INT NOT NULL,
    consequences INT NOT NULL,
    probability INT NOT NULL,
    riskLevel INT NOT NULL,
    category NVARCHAR(50) NOT NULL,
    acceptability NVARCHAR(50) NOT NULL,
    recommendedMeasures NVARCHAR(MAX) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (procenaId) REFERENCES ProcenaRizika(id),
    UNIQUE (procenaId, riskId)
);
```

### korisnici (Users) - Already exists
```sql
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
);
```

## Risk Groups (Default Data)

The following risk groups are seeded by default:

1. Organizacija i rukovodstvo
2. Radno okruženje
3. Radni procesi
4. Tehnička sredstva
5. Fizička sigurnost
6. Zdravlje na radu
7. Ekologija
8. Informaciona sigurnost
9. Pravna usklađenost
10. Finansijski rizici
11. Reputacioni rizici

## Database Connection

The application uses direct SQL Server connection via the `mssql` package.
Connection configuration is in `lib/db.ts`.

## Seeding Data

To seed the database with default risk groups:
```bash
npm run db:seed
```