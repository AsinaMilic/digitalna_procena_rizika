import { PrilogMData } from '../data/riskDataLoader';

export interface PrilogMSectionData {
  sectionNumber: number;
  sectionTitle: string;
  totalItems: number;
  completedItems: number;
  averageVO?: number;
  averageIzlozenost?: number;
  averageRanjivost?: number;
  averageVerovatnoca?: number;
  averagePosledice?: number;
  averageSteta?: number;
  averageKriticnost?: number;
  averageNivoRizika?: number;
  dominantnaKategorija?: number;
  prihvatljivostStatus?: string;
}

export interface PrilogMSummaryData {
  ukupnoStavki: number;
  ukupnoZavrsenih: number;
  ukupanNivoRizika?: number;
  ukupnaKategorija?: number;
  ukupnaPrihvatljivost?: string;
  procenatZavrsenosti: number;
  preporuke?: string;
}

// Mapiranje sekcija
const SECTION_MAP: { [key: string]: { number: number; title: string } } = {
  '1': { number: 1, title: 'ОПШТИХ ПОСЛОВНИХ АКТИВНОСТИ' },
  '2': { number: 2, title: 'ПО БЕЗБЕДНОСТ И ЗДРАВЉЕ НА РАДУ' },
  '3': { number: 3, title: 'ПРАВНИ РИЗИЦИ' },
  '4': { number: 4, title: 'ОД ПРОТИВПРАВНОГ ДЕЛОВАЊА' },
  '5': { number: 5, title: 'ОД ПОЖАРА' },
  '6': { number: 6, title: 'ОД ЕЛЕМЕНТАРНИХ НЕПОГОДА И ДРУГИХ НЕСРЕЋА' },
  '7': { number: 7, title: 'ОД ЕКСПЛОЗИЈА' },
  '8': { number: 8, title: 'ОД НЕУСАГЛАШЕНОСТИ СА СТАНДАРДИМА' },
  '9': { number: 9, title: 'ПО ЖИВОТНУ СРЕДИНУ' },
  '10': { number: 10, title: 'У УПРАВЉАЊУ ЉУДСКИМ РЕСУРСИМА' },
  '11': { number: 11, title: 'У ОБЛАСТИ ИКТ СИСТЕМА' }
};

export function calculatePrilogMSections(prilogMData: PrilogMData[]): {
  sections: PrilogMSectionData[];
  summary: PrilogMSummaryData;
} {
  // Grupiši podatke po sekcijama
  const sectionGroups: { [key: number]: PrilogMData[] } = {};
  
  prilogMData.forEach(item => {
    const majorSection = parseInt(item.id.split('.')[0]);
    if (!sectionGroups[majorSection]) {
      sectionGroups[majorSection] = [];
    }
    sectionGroups[majorSection].push(item);
  });

  // Izračunaj podatke za svaku sekciju
  const sections: PrilogMSectionData[] = [];
  
  Object.keys(sectionGroups).forEach(sectionKey => {
    const sectionNumber = parseInt(sectionKey);
    const sectionInfo = SECTION_MAP[sectionKey];
    const items = sectionGroups[sectionNumber];
    
    if (!sectionInfo || items.length === 0) return;

    const completedItems = items.filter(item => 
      item.velicinaOpasnosti && 
      item.posledice && 
      item.steta
    );

    const section: PrilogMSectionData = {
      sectionNumber,
      sectionTitle: sectionInfo.title,
      totalItems: items.length,
      completedItems: completedItems.length
    };

    if (completedItems.length > 0) {
      // Izračunaj proseke
      section.averageVO = Math.round(
        completedItems.reduce((sum, item) => sum + (item.velicinaOpasnosti || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageIzlozenost = Math.round(
        completedItems.reduce((sum, item) => sum + (item.izlozenost || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageRanjivost = Math.round(
        completedItems.reduce((sum, item) => sum + (item.ranjivost || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageVerovatnoca = Math.round(
        completedItems.reduce((sum, item) => sum + (item.verovatnoca || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averagePosledice = Math.round(
        completedItems.reduce((sum, item) => sum + (item.posledice || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageSteta = Math.round(
        completedItems.reduce((sum, item) => sum + (item.steta || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageKriticnost = Math.round(
        completedItems.reduce((sum, item) => sum + (item.kriticnost || 0), 0) / completedItems.length * 100
      ) / 100;
      
      section.averageNivoRizika = Math.round(
        completedItems.reduce((sum, item) => sum + (item.nivoRizika || 0), 0) / completedItems.length * 100
      ) / 100;

      // Dominantna kategorija (najčešća)
      const categories = completedItems.map(item => item.kategorijaRizika || 5);
      const categoryCount: { [key: number]: number } = {};
      categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      section.dominantnaKategorija = parseInt(
        Object.keys(categoryCount).reduce((a, b) => 
          categoryCount[parseInt(a)] > categoryCount[parseInt(b)] ? a : b
        )
      );

      // Status prihvatljivosti
      const neprihvatljivi = completedItems.filter(item => item.prihvatljivost === 'NEPRIHVATLJIV').length;
      const prihvatljivi = completedItems.length - neprihvatljivi;
      
      if (neprihvatljivi === 0) {
        section.prihvatljivostStatus = 'PRIHVATLJIV';
      } else if (prihvatljivi === 0) {
        section.prihvatljivostStatus = 'NEPRIHVATLJIV';
      } else {
        section.prihvatljivostStatus = 'MEŠOVIT';
      }
    }

    sections.push(section);
  });

  // Sortiraj sekcije po broju
  sections.sort((a, b) => a.sectionNumber - b.sectionNumber);

  // Izračunaj ukupne podatke
  const ukupnoStavki = prilogMData.length;
  const ukupnoZavrsenih = prilogMData.filter(item => 
    item.velicinaOpasnosti && 
    item.posledice && 
    item.steta
  ).length;

  const summary: PrilogMSummaryData = {
    ukupnoStavki,
    ukupnoZavrsenih,
    procenatZavrsenosti: ukupnoStavki > 0 ? Math.round((ukupnoZavrsenih / ukupnoStavki) * 10000) / 100 : 0
  };

  if (ukupnoZavrsenih > 0) {
    const completedItems = prilogMData.filter(item => 
      item.velicinaOpasnosti && 
      item.posledice && 
      item.steta
    );

    summary.ukupanNivoRizika = Math.round(
      completedItems.reduce((sum, item) => sum + (item.nivoRizika || 0), 0) / completedItems.length * 100
    ) / 100;

    // Ukupna kategorija (najčešća)
    const categories = completedItems.map(item => item.kategorijaRizika || 5);
    const categoryCount: { [key: number]: number } = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    summary.ukupnaKategorija = parseInt(
      Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[parseInt(a)] > categoryCount[parseInt(b)] ? a : b
      )
    );

    // Ukupna prihvatljivost
    const neprihvatljivi = completedItems.filter(item => item.prihvatljivost === 'NEPRIHVATLJIV').length;
    const prihvatljivi = completedItems.length - neprihvatljivi;
    
    if (neprihvatljivi === 0) {
      summary.ukupnaPrihvatljivost = 'PRIHVATLJIV';
    } else if (prihvatljivi === 0) {
      summary.ukupnaPrihvatljivost = 'NEPRIHVATLJIV';
    } else {
      summary.ukupnaPrihvatljivost = 'MEŠOVIT';
    }

    // Generiši preporuke
    if (summary.ukupnaPrihvatljivost === 'NEPRIHVATLJIV') {
      summary.preporuke = 'Potrebno je hitno preduzeti mere za smanjenje rizika u svim neprihvatljivim kategorijama.';
    } else if (summary.ukupnaPrihvatljivost === 'MEŠOVIT') {
      summary.preporuke = 'Potrebno je preduzeti mere za smanjenje rizika u identifikovanim neprihvatljivim kategorijama.';
    } else {
      summary.preporuke = 'Trenutni nivo rizika je prihvatljiv. Preporučuje se redovno praćenje i ažuriranje procene.';
    }
  }

  return { sections, summary };
}