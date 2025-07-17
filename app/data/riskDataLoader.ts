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
  verovatnoca: number | null; // Kolona 6 - I × R
  posledice: number | null; // Kolona 7
  steta: number | null; // Kolona 8
  kriticnost: number | null; // Kolona 9
  nivoRizika: number | null; // Kolona 10 - V × P
  kategorijaRizika: number | null; // Kolona 11
  prihvatljivost: 'PRIHVATLJIV' | 'NEPRIHVATLJIV' | null; // Kolona 12
}

// Matrice za računanje (iz priloga N, Nj, O, P)
export const MATRICE = {
  // Matrica za verovatnoću (Prilog N, tabela N.5)
  verovatnoca: [
    [1, 2, 3, 4, 5], // Ranjivost 1 (vrlo velika) vs Izloženost 1-5
    [3, 2, 1, 1, 1], // Ranjivost 2 (velika)
    [4, 3, 2, 2, 1], // Ranjivost 3 (srednja)
    [5, 4, 3, 3, 2], // Ranjivost 4 (mala)
    [5, 5, 4, 3, 3]  // Ranjivost 5 (vrlo mala)
  ],
  
  // Matrica za posledice (Prilog Nj, tabela Nj.3)
  posledice: [
    [1, 1, 1, 1, 1], // Šteta 1 (vrlo mala) vs Kritičnost 1-5
    [3, 2, 2, 1, 1], // Šteta 2 (mala)
    [4, 3, 2, 2, 2], // Šteta 3 (srednja)
    [5, 4, 3, 3, 3], // Šteta 4 (velika)
    [5, 5, 4, 3, 3]  // Šteta 5 (vrlo velika)
  ],
  
  // Matrica za nivo rizika (Prilog O, tabela O.2)
  nivoRizika: [
    [1, 2, 3, 4, 5],   // Verovatnoća 1 vs Posledice 1-5
    [2, 4, 6, 8, 10],  // Verovatnoća 2
    [3, 6, 9, 12, 15], // Verovatnoća 3
    [4, 8, 12, 16, 20], // Verovatnoća 4
    [5, 10, 15, 20, 25] // Verovatnoća 5
  ]
};

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

// Računanje Prilog M podataka
export function calculatePrilogM(
  velicinaOpasnosti: number,
  stepenIzlozenosti: number = 3, // default vrednost
  stepenRanjivosti: number = 3,  // default vrednost
  steta: number = 3,             // default vrednost
  kriticnost: number = 3         // default vrednost
): Partial<PrilogMData> {
  
  // Kolona 4: Izloženost = (Si + VO)/2
  const izlozenost = Math.round((stepenIzlozenosti + velicinaOpasnosti) / 2);
  
  // Kolona 5: Ranjivost = (Sr + VO)/2
  const ranjivost = Math.round((stepenRanjivosti + velicinaOpasnosti) / 2);
  
  // Kolona 6: Verovatnoća iz matrice
  const verovatnoca = MATRICE.verovatnoca[ranjivost - 1]?.[izlozenost - 1] || 1;
  
  // Kolona 7: Posledice iz matrice
  const posledice = MATRICE.posledice[steta - 1]?.[kriticnost - 1] || 1;
  
  // Kolona 10: Nivo rizika iz matrice
  const nivoRizika = MATRICE.nivoRizika[verovatnoca - 1]?.[posledice - 1] || 1;
  
  // Kolona 11: Kategorija rizika
  const kategorijaRizika = getKategorijaRizika(nivoRizika);
  
  // Kolona 12: Prihvatljivost
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