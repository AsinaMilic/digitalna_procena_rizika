# Next.js + Prisma + Azure SQL setup

**1. Podesi konekciju u `.env` (primer):**

```
DATABASE_URL="sqlserver://USERNAME:PASSWORD@HOST:PORT?database=IME_BAZE"
```

**2. Instaliraj dependencies**

```
npm install prisma @prisma/client
```

**3. Generiši model i pokreni migraciju**

```
npx prisma generate
npx prisma db push
```

**4. Seeduj osnovne grupe rizika**

```
npx tsx prisma/seed.ts
```

**5. Korišćenje u Next.js backendu**

```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Pravno lice
await prisma.pravnoLice.create({ data: { naziv: "Test", pib: "123..." }})

// Kreiraj procenu
await prisma.procenaRizika.create({ data: { pravnoLiceId: id } })

// Unos za grupu
await prisma.unosRizika.create({ data: { procenaId, grupaId, polje: 'field1', vrednost: 'Nešto' } })

// Procitaj sve grupe
const grupe = await prisma.grupaRizika.findMany({ orderBy: { redosled: 'asc' }})
```

**Za više opcija/problema:**
https://www.prisma.io/docs/orm/reference/database-reference/connection-urls#microsoft-sql-server
