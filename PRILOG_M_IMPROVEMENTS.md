# 🚀 Poboljšanja Prilog M - Analiza i vrednovanje rizika

## 📋 Pregled poboljšanja

Aplikacija je značajno poboljšana da bude potpuno usklađena sa standardom **SRPS A.L2.003:2025** za Prilog M (Analiza i vrednovanje rizika).

## ✅ Implementirane funkcionalnosti

### 1. **Kompletne formule prema standardu**

#### Kolona 4: Izloženost (I)
```typescript
I = (Si + VO)/2
```
- Si = stepen izloženosti (može se podesiti)
- VO = veličina opasnosti (iz korisničkog klika)

#### Kolona 5: Ranjivost (R)
```typescript
R = (Sr + VO)/2
```
- Sr = stepen ranjivosti (može se podesiti)
- VO = veličina opasnosti

#### Kolona 6: Verovatnoća (V)
```typescript
V = I × R (iz matrice N.5)
```
- Koristi se matrica iz Priloga N, tabela N.5

#### Kolona 8: Šteta (Š)
```typescript
Š = (SŠ + VMŠ)/2
```
- **SŠ** = Stvarna šteta (iz finansijskih podataka)
- **VMŠ** = Verovatno maksimalna šteta = SVnpoz × Ivo

#### VMŠ kalkulacija (prema standardu)
```typescript
VMŠ = SVnpoz × Ivo
Ivo = Iud × Kvo
```
- **SVnpoz** = Sadašnja vrednost nekretina, postrojenja, opreme i zaliha
- **Iud** = Indeks uticaja delatnosti (iz Priloga B1)
- **Kvo** = Koeficijent (10%-30% na osnovu VO)

#### Kolona 7: Posledice (P)
```typescript
P = Š × K (iz matrice Nj.3)
```

#### Kolona 10: Nivo rizika (NR)
```typescript
NR = V × P (iz matrice O.2)
```

### 2. **Matrice prema standardu**

- **Matrica verovatnoće** (Prilog N, tabela N.5) ✅
- **Matrica posledica** (Prilog Nj, tabela Nj.3) ✅
- **Matrica nivo rizika** (Prilog O, tabela O.2) ✅

### 3. **Finansijski podaci**

Dodana je mogućnost unosa stvarnih finansijskih podataka:
- **Poslovni prihodi** (AOP 1001) - za kalkulaciju SŠ
- **Vrednost imovine** (SVnpoz) - za kalkulaciju VMŠ
- **Delatnost** - za Iud indeks
- **Stvarna šteta** - evidentirana šteta

### 4. **Indeks uticaja delatnosti (Iud)**

Implementiran je kompletan Prilog B1 sa indeksima za različite delatnosti:
- Proizvodnja (0.12-0.30)
- Usluge (0.08-0.18)
- Javni sektor (0.06-0.15)
- Ostalo (0.12-0.30)

### 5. **Validacija podataka**

Dodana je validacija koja proverava:
- Da li su svi podaci u opsegu 1-5
- Da li je nivo rizika između 1-25
- Da li je kategorija rizika između 1-5
- Da li je prihvatljivost validna

### 6. **Detaljni prikaz kalkulacija**

Dodana je komponenta `PrilogMDetails` koja prikazuje:
- Sve formule korak po korak
- Reference na standard
- Objašnjenja kalkulacija
- Finalne rezultate

## 🎯 Kako koristiti poboljšanja

### 1. **Ažuriranje baze podataka**
```bash
npm run db:update-prilog-m
```

### 2. **Unos finansijskih podataka**
- Kliknite na dugme "💰 Finansijski podaci"
- Unesite stvarne finansijske podatke
- Podaci će se automatski koristiti u kalkulacijama

### 3. **Prikaz detalja**
- U Prilog M tabeli kliknite na dugme "📊" 
- Videćete detaljne kalkulacije za svaku stavku

## 📊 Struktura baze podataka

Dodane su nove kolone u `PrilogM` tabelu:
```sql
-- Parametri za kalkulacije
stepenIzlozenosti INTEGER DEFAULT 3,
stepenRanjivosti INTEGER DEFAULT 3,
stvarnaSteta DECIMAL(15,2) DEFAULT 0,
poslovniPrihodi DECIMAL(15,2) DEFAULT 1000000,
vrednostImovine DECIMAL(15,2) DEFAULT 5000000,
delatnost VARCHAR(100) DEFAULT 'default',

-- Kalkulisane vrednosti
stepenSS INTEGER,
stepenVMSH INTEGER,
vmshIznos DECIMAL(15,2)
```

## 🔧 API endpointi

### Finansijski podaci
- `POST /api/procena/[id]/financial-data` - Čuvanje
- `GET /api/procena/[id]/financial-data` - Učitavanje

### Prilog M
- `POST /api/procena/[id]/prilog-m` - Čuvanje (ažurirano)
- `GET /api/procena/[id]/prilog-m` - Učitavanje (ažurirano)

## 🎉 Rezultat

Aplikacija sada **potpuno implementira Prilog M** prema standardu SRPS A.L2.003:2025:

✅ **Sve formule su implementirane**  
✅ **Matrice su ispravne**  
✅ **Finansijski podaci se koriste**  
✅ **VMŠ se kalkuliše prema standardu**  
✅ **Iud indeks je implementiran**  
✅ **Validacija je dodana**  
✅ **Detaljni prikaz je dostupan**  

**Tabela iz Priloga M se sada pravi i izračunava potpuno prema standardu!** 🎯