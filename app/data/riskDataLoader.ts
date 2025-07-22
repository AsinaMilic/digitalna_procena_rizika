import { RiskGroupData } from './riskGroups';
import { GROUP1_DATA } from './group1Data';
import { GROUP2_DATA } from './group2Data';
import { GROUP3_DATA } from './group3Data';
import { GROUP4_DATA } from './group4Data';
import { GROUP5_DATA } from './group5Data';
import { GROUP6_DATA } from './group6Data';
import { GROUP7_DATA } from './group7Data';
import { GROUP8_DATA } from './group8Data';
import { GROUP9_DATA } from './group9Data';
import { GROUP10_DATA } from './group10Data';
import { GROUP11_DATA } from './group11Data';

// Prilog M - Analiza i vrednovanje rizika
export interface PrilogMData {
  id: string; // npr. "1.1", "2.1", itd.
  groupId: string; // "group1", "group2", itd.
  requirement: string;
  velicinaOpasnosti: number | null; // Kolona 3 - iz korisničkog unosa
  izlozenost: number | null; // Kolona 4 - (Si + VO)/2
  ranjivost: number | null; // Kolona 5 - (Sr + VO)/2
  verovatnoca: number | null; // Kolona 6 - I × R (iz matrice)
  posledice: number | null; // Kolona 7 - Š × K (iz matrice)
  steta: number | null; // Kolona 8 - (SŠ + VMŠ)/2
  kriticnost: number | null; // Kolona 9 - prema kriterijumu
  nivoRizika: number | null; // Kolona 10 - V × P (iz matrice)
  kategorijaRizika: number | null; // Kolona 11 - prema tabeli P.1
  prihvatljivost: 'PRIHVATLJIV' | 'NEPRIHVATLJIV' | null; // Kolona 12 - prema tabeli P.2
}

// Matrice za računanje (iz priloga N, Nj, O, P)
export const MATRICE = {
  // Matrica za verovatnoću (Prilog N, tabela N.5)
  // RANJIVOST (redovi) vs IZLOŽENOST (kolone)
  verovatnoca: [
    [1, 2, 3, 4, 5], // Ranjivost 1 (vrlo velika) vs Izloženost 1-5 (zanemarljiva-trajna)
    [3, 2, 1, 1, 1], // Ranjivost 2 (velika)
    [4, 3, 2, 2, 1], // Ranjivost 3 (srednja)
    [5, 4, 3, 3, 2], // Ranjivost 4 (mala)
    [5, 5, 4, 3, 3]  // Ranjivost 5 (vrlo mala)
  ],
  
  // Matrica za posledice (Prilog Nj, tabela Nj.3)
  // ŠTETA (redovi) vs KRITIČNOST (kolone)
  posledice: [
    [1, 1, 1, 1, 1], // Šteta 1 (vrlo mala) vs Kritičnost 1-5 (vrlo velika-minimalna)
    [3, 2, 2, 1, 1], // Šteta 2 (mala)
    [4, 3, 2, 2, 2], // Šteta 3 (srednja)
    [5, 4, 3, 3, 3], // Šteta 4 (velika)
    [5, 5, 4, 3, 3]  // Šteta 5 (vrlo velika)
  ],
  
  // Matrica za nivo rizika (Prilog O, tabela O.2)
  // VEROVATNOĆA (redovi) vs POSLEDICE (kolone)
  nivoRizika: [
    [1, 2, 3, 4, 5],   // Verovatnoća 1 (retko) vs Posledice 1-5
    [2, 4, 6, 8, 10],  // Verovatnoća 2 (malo verovatno)
    [3, 6, 9, 12, 15], // Verovatnoća 3 (umereno verovatno)
    [4, 8, 12, 16, 20], // Verovatnoća 4 (verovatno)
    [5, 10, 15, 20, 25] // Verovatnoća 5 (skoro sigurno)
  ]
};

// Prilog B1 - Indeks uticaja delatnosti (Iud) - prema standardu
export const UTICAJ_DELATNOSTI: { [key: string]: number } = {
  // Proizvodnja
  'proizvodnja_hrane': 0.15,
  'proizvodnja_tekstila': 0.12,
  'proizvodnja_hemikalija': 0.25,
  'proizvodnja_metala': 0.20,
  'proizvodnja_masina': 0.18,
  'proizvodnja_vozila': 0.22,
  
  // Usluge
  'trgovina_na_malo': 0.10,
  'trgovina_na_veliko': 0.12,
  'transport': 0.18,
  'skladistenje': 0.15,
  'finansijske_usluge': 0.08,
  'osiguranje': 0.10,
  'informaticke_usluge': 0.12,
  'konsalting': 0.08,
  
  // Javni sektor
  'javna_uprava': 0.06,
  'obrazovanje': 0.08,
  'zdravstvo': 0.15,
  'socijalna_zastita': 0.10,
  
  // Ostalo
  'gradjevinarstvo': 0.22,
  'energetika': 0.25,
  'rudarstvo': 0.30,
  'poljoprivreda': 0.18,
  'turizam': 0.12,
  'default': 0.15 // Default vrednost ako delatnost nije definisana
};

// Kriterijumi za stetu (Prilog Nj, tabela Nj.1 i Nj.1a)
export const KRITERIJUMI_STETE = {
  // Stvarna šteta (SŠ) - u odnosu na poslovne prihode (AOP 1001)
  stvarnaSteta: [
    { min: 0, max: 5, stepen: 1 },      // ≤ 5% - vrlo mala
    { min: 5, max: 10, stepen: 2 },     // > 5% ≤ 10% - mala
    { min: 10, max: 15, stepen: 3 },    // > 10% ≤ 15% - srednja
    { min: 15, max: 20, stepen: 4 },    // > 15% ≤ 20% - velika
    { min: 20, max: 100, stepen: 5 }    // > 20% - vrlo velika
  ],
  
  // Verovatno maksimalna šteta (VMŠ) - u odnosu na vrednost imovine
  verovatnoMaksimalnaSteta: [
    { min: 0, max: 5, stepen: 1 },      // ≤ 5% - vrlo mala
    { min: 5, max: 10, stepen: 2 },     // > 5% ≤ 10% - mala
    { min: 10, max: 15, stepen: 3 },    // > 10% ≤ 15% - srednja
    { min: 15, max: 20, stepen: 4 },    // > 15% ≤ 20% - velika
    { min: 20, max: 100, stepen: 5 }    // > 20% - vrlo velika
  ]
};

// Kriterijumi za kritičnost (Prilog Nj, tabela Nj.2)
export const KRITERIJUMI_KRITICNOSTI = [
  { stepen: 1, naziv: 'Vrlo velika', opis: 'Potpuni prekid funkcionisanja organizacije' },
  { stepen: 2, naziv: 'Velika', opis: 'Ozbiljno narušavanje funkcionisanja organizacije' },
  { stepen: 3, naziv: 'Srednja', opis: 'Funkcionisanje uz povećanje napora i dopuna sredstava' },
  { stepen: 4, naziv: 'Mala', opis: 'Mogući poremećaji u procesu rada' },
  { stepen: 5, naziv: 'Minimalna', opis: 'Problemi koji se rešavaju u hodu' }
];

// Kategorije rizika (Prilog P, tabela P.1)
export function getKategorijaRizika(nivoRizika: number): number {
  if (nivoRizika >= 1 && nivoRizika <= 2) return 5; // PETA - vrlo mali
  if (nivoRizika >= 3 && nivoRizika <= 5) return 4; // ČETVRTA - mali
  if (nivoRizika >= 6 && nivoRizika <= 9) return 3; // TREĆA - umereno veliki
  if ([10, 12, 15, 16].includes(nivoRizika)) return 2; // DRUGA - veliki
  if ([20, 25].includes(nivoRizika)) return 1; // PRVA - izrazito veliki
  return 5; // default
}

// Prihvatljivost rizika (Prilog P, tabela P.2)
export function getPrihvatljivost(nivoRizika: number): 'PRIHVATLJIV' | 'NEPRIHVATLJIV' {
  return [1, 2, 3, 4, 5].includes(nivoRizika) ? 'PRIHVATLJIV' : 'NEPRIHVATLJIV';
}

// Funkcije za računanje štete prema standardu
export function calculateStvarnaSteta(
  stetnIznos: number, 
  poslovniPrihodi: number
): number {
  if (poslovniPrihodi === 0) return 1;
  
  const procenat = (stetnIznos / poslovniPrihodi) * 100;
  
  for (const kriterijum of KRITERIJUMI_STETE.stvarnaSteta) {
    if (procenat > kriterijum.min && procenat <= kriterijum.max) {
      return kriterijum.stepen;
    }
  }
  return 1; // default
}

export function calculateVerovatnoMaksimalnaSteta(
  vrednostImovine: number,
  velicinaOpasnosti: number,
  delatnost: string = 'default'
): { vmsh: number, stepenVMSH: number } {
  // Iud - indeks uticaja delatnosti
  const iud = UTICAJ_DELATNOSTI[delatnost] || UTICAJ_DELATNOSTI.default;
  
  // Kvo - koeficijent na osnovu VO (10%, 15%, 20%, 25%, 30%)
  const kvoMapping = { 1: 0.10, 2: 0.15, 3: 0.20, 4: 0.25, 5: 0.30 };
  const kvo = kvoMapping[velicinaOpasnosti as keyof typeof kvoMapping] || 0.20;
  
  // Ivo = Iud × Kvo
  const ivo = iud * kvo;
  
  // VMŠ = SVnpoz × Ivo
  const vmsh = vrednostImovine * ivo;
  
  // Stepen VMŠ na osnovu procenta od vrednosti imovine
  const procenat = (vmsh / vrednostImovine) * 100;
  
  let stepenVMSH = 1;
  for (const kriterijum of KRITERIJUMI_STETE.verovatnoMaksimalnaSteta) {
    if (procenat > kriterijum.min && procenat <= kriterijum.max) {
      stepenVMSH = kriterijum.stepen;
      break;
    }
  }
  
  return { vmsh, stepenVMSH };
}

// Glavna funkcija za računanje Prilog M podataka - POTPUNO PREMA STANDARDU
export function calculatePrilogM(
  velicinaOpasnosti: number,
  stepenIzlozenosti: number = 3,
  stepenRanjivosti: number = 3,
  stvarnaSteta: number = 0,
  poslovniPrihodi: number = 1000000, // default 1M RSD
  vrednostImovine: number = 5000000, // default 5M RSD
  delatnost: string = 'default',
  kriticnost: number = 3
): Partial<PrilogMData> {
  
  // KOLONA 4: Izloženost = (Si + VO)/2
  const izlozenost = Math.round((stepenIzlozenosti + velicinaOpasnosti) / 2);
  
  // KOLONA 5: Ranjivost = (Sr + VO)/2  
  const ranjivost = Math.round((stepenRanjivosti + velicinaOpasnosti) / 2);
  
  // KOLONA 6: Verovatnoća = I × R (iz matrice N.5)
  const verovatnocaIndex = Math.min(Math.max(ranjivost - 1, 0), 4);
  const izlozenostIndex = Math.min(Math.max(izlozenost - 1, 0), 4);
  const verovatnoca = MATRICE.verovatnoca[verovatnocaIndex][izlozenostIndex];
  
  // KOLONA 8: Šteta = (SŠ + VMŠ)/2
  const stepenSS = calculateStvarnaSteta(stvarnaSteta, poslovniPrihodi);
  const { stepenVMSH } = calculateVerovatnoMaksimalnaSteta(vrednostImovine, velicinaOpasnosti, delatnost);
  const steta = Math.round((stepenSS + stepenVMSH) / 2);
  
  // KOLONA 7: Posledice = Š × K (iz matrice Nj.3)
  const stetaIndex = Math.min(Math.max(steta - 1, 0), 4);
  const kriticnostIndex = Math.min(Math.max(kriticnost - 1, 0), 4);
  const posledice = MATRICE.posledice[stetaIndex][kriticnostIndex];
  
  // KOLONA 10: Nivo rizika = V × P (iz matrice O.2)
  const verovatnocaIndexNR = Math.min(Math.max(verovatnoca - 1, 0), 4);
  const poslediceIndexNR = Math.min(Math.max(posledice - 1, 0), 4);
  const nivoRizika = MATRICE.nivoRizika[verovatnocaIndexNR][poslediceIndexNR];
  
  // KOLONA 11: Kategorija rizika (prema tabeli P.1)
  const kategorijaRizika = getKategorijaRizika(nivoRizika);
  
  // KOLONA 12: Prihvatljivost (prema tabeli P.2)
  const prihvatljivost = getPrihvatljivost(nivoRizika);
  
  return {
    velicinaOpasnosti,
    izlozenost,
    ranjivost,
    verovatnoca,
    posledice,
    steta,
    kriticnost,
    nivoRizika,
    kategorijaRizika,
    prihvatljivost
  };
}

// Funkcija za validaciju Prilog M podataka
export function validatePrilogMData(data: Partial<PrilogMData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Proveri da li su svi podaci u validnom opsegu (1-5)
  const fieldsToCheck = ['velicinaOpasnosti', 'izlozenost', 'ranjivost', 'verovatnoca', 'posledice', 'steta', 'kriticnost'];
  
  fieldsToCheck.forEach(field => {
    const value = data[field as keyof typeof data] as number;
    if (value !== null && value !== undefined && (value < 1 || value > 5)) {
      errors.push(`${field} mora biti između 1 i 5, trenutno je ${value}`);
    }
  });
  
  // Proveri nivo rizika (1-25)
  if (data.nivoRizika !== null && data.nivoRizika !== undefined) {
    if (data.nivoRizika < 1 || data.nivoRizika > 25) {
      errors.push(`Nivo rizika mora biti između 1 i 25, trenutno je ${data.nivoRizika}`);
    }
  }
  
  // Proveri kategoriju rizika (1-5)
  if (data.kategorijaRizika !== null && data.kategorijaRizika !== undefined) {
    if (data.kategorijaRizika < 1 || data.kategorijaRizika > 5) {
      errors.push(`Kategorija rizika mora biti između 1 i 5, trenutno je ${data.kategorijaRizika}`);
    }
  }
  
  // Proveri prihvatljivost
  if (data.prihvatljivost && !['PRIHVATLJIV', 'NEPRIHVATLJIV'].includes(data.prihvatljivost)) {
    errors.push(`Prihvatljivost mora biti 'PRIHVATLJIV' ili 'NEPRIHVATLJIV', trenutno je ${data.prihvatljivost}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funkcija za učitavanje podataka grupe rizika
export function getRiskGroupData(groupId: string): RiskGroupData | null {
    switch (groupId) {
        case 'group1':
            return GROUP1_DATA;
        case 'group2':
            return GROUP2_DATA;
        case 'group3':
            return GROUP3_DATA;
        case 'group4':
            return GROUP4_DATA;
        case 'group5':
            return GROUP5_DATA;
        case 'group6':
            return GROUP6_DATA;
        case 'group7':
            return GROUP7_DATA;
        case 'group8':
            return GROUP8_DATA;
        case 'group9':
            return GROUP9_DATA;
        case 'group10':
            return GROUP10_DATA;
        case 'group11':
            return GROUP11_DATA;
        default:
            return null;
    }
}