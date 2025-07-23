# Popravka finansijskih podataka u proceni rizika

## Problem
Sistem je dozvoljavao kalkulaciju prihvatljivosti/neprihvatljivosti rizika čak i bez unosa stvarnih finansijskih podataka, koristeći default vrednosti (1M RSD za prihode, 5M RSD za imovinu).

## Rešenje implementirano

### 1. **Validacija finansijskih podataka**
- API sada vraća 0 umesto default vrednosti kada nema podataka
- Forma zahteva obavezno unošenje poslovnih prihoda i vrednosti imovine
- Dodana validacija da vrednosti moraju biti > 0

### 2. **Vizuelna upozorenja**
- **FinancialDataWarning.tsx** - Crveno upozorenje kada nema validnih podataka
- **Upozorenje u tabeli** - Narandžasti ⚠️ simbol pored prihvatljivosti kada se koriste default vrednosti
- **Informativno upozorenje** - Detaljno objašnjenje zašto su potrebni finansijski podaci

### 3. **Poboljšana forma**
- Polja označena kao obavezna sa * 
- Crveni okvir oko praznih polja
- Validacija pre slanja forme
- Informativni tekst o važnosti podataka prema standardu

### 4. **Logika kalkulacije**
- Sistem i dalje može da računa sa fallback vrednostima za tehničke potrebe
- Ali jasno označava kada se koriste nepouzdani podaci
- Upozorava korisnika da rezultati mogu biti netačni

## Izmenjeni fajlovi

1. **app/components/RiskAssessmentTable.tsx**
   - Dodana provera validnosti finansijskih podataka
   - Integracija upozorenja i forme

2. **app/components/FinancialDataForm.tsx**
   - Validacija obaveznih polja
   - Vizuelni indikatori za obavezna polja
   - Informativno upozorenje o važnosti podataka

3. **app/components/PrilogMTable.tsx**
   - Dodato upozorenje ⚠️ pored prihvatljivosti kada se koriste default vrednosti

4. **app/components/FinancialDataWarning.tsx** (novo)
   - Komponenta za upozorenje o nedostajućim podacima

5. **app/api/procena/[id]/financial-data/route.ts**
   - API vraća 0 umesto default vrednosti

## Rezultat

- **Korisnik ne može da ignoriše** potrebu za finansijskim podacima
- **Jasno upozorenje** kada se koriste nepouzdani podaci  
- **Usklađenost sa standardom** SRPS A.L2.003:2025
- **Sprečavanje pogrešnih odluka** na osnovu netačnih kalkulacija

## Testiranje

1. Otvoriti procenu rizika bez finansijskih podataka
2. Videti crveno upozorenje na vrhu
3. Pokušati kalkulaciju - videti ⚠️ simbol
4. Uneti validne finansijske podatke
5. Potvrditi da upozorenja nestaju