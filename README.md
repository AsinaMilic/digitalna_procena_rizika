# Digital Risk Assessment Application

A Next.js application for digital risk assessment and management, built for legal entities to evaluate and manage various types of risks.

## Features

- **User Authentication** - Registration, login, and admin approval system
- **Legal Entity Management** - Create and manage legal entities (pravna lica)
- **Risk Assessment** - Comprehensive risk evaluation across 11 categories
- **Risk Matrix Generation** - Automated risk analysis and categorization
- **Admin Panel** - User management and system administration

## Getting Started

### Prerequisites

- Node.js 18+ 
- SQL Server (Azure SQL Database supported)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
# Database Configuration
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your_server_host
DB_PORT=1433

# Database URL (for reference)
DATABASE_URL="sqlserver://your_server:1433;database=your_db;user=your_user;password=your_pass;encrypt=true;trustServerCertificate=false"
```

4. Run the development server:
```bash
npm run dev
```

5. Seed the database with default risk groups:
```bash
npm run db:seed
```
(Note: The development server must be running for seeding to work)

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database

This application uses **direct SQL Server connections** via the `mssql` package for optimal performance and Azure SQL compatibility.

- Database schema documentation: `DATABASE_SCHEMA.md`
- Connection configuration: `lib/db.ts`
- Seed endpoint: `app/api/seed/route.ts`

## Risk Categories

The system evaluates risks across 11 predefined categories:

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

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── admin/            # Admin panel
│   ├── procena/          # Risk assessment pages
│   └── ...
├── lib/                   # Utilities and database connection
├── scripts/              # Database scripts
└── public/               # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed database with default data

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQL Server
- **Database**: Microsoft SQL Server / Azure SQL Database
- **Authentication**: JWT with bcrypt password hashing
