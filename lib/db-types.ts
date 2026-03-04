// Database type definitions for Azure SQL

export interface Korisnik {
  id: number;
  email: string;
  lozinka: string;
  ime: string;
  prezime: string;
  status: string;
  je_admin: boolean | number; // Can be BIT (0/1) or boolean
  datum_kreiranja: Date;
  datum_odobrenja: Date | null;
  odobrio_admin: number | null;
}

export interface PravnoLice {
  id: number;
  naziv: string;
  skraceno_poslovno_ime: string | null;
  pib: string;
  maticni_broj: string | null;
  adresa: string | null;
  adresa_sediste: string | null;
  adresa_ostala: string | null;
  sifra_delatnosti: string | null;
  lice_zastupanje: string | null;
  lice_komunikacija: string | null;
  tim_procena_rizika: string | null;
  telefon: string | null;
  telefon_faks: string | null;
  email: string | null;
  internet_adresa: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcenaRizika {
  id: number;
  naziv: string;
  opis: string | null;
  korisnikId: number | null;
  pravnoLiceId: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrilogM {
  id: number;
  procenaId: number;
  itemId: string;
  groupId: string;
  requirement: string | null;
  velicinaOpasnosti: number | null;
  izlozenost: number | null;
  ranjivost: number | null;
  verovatnoca: number | null;
  steta: number | null;
  kriticnost: number | null;
  posledice: number | null;
  nivoRizika: number | null;
  kategorijaRizika: number | null;
  prihvatljivost: string | null;
  stepenIzlozenosti: number;
  stepenRanjivosti: number;
  stvarnaSteta: number;
  poslovniPrihodi: number;
  vrednostImovine: number;
  delatnost: string;
  stepenSS: number | null;
  stepenVMSH: number | null;
  vmshIznos: number | null;
  opisIdentifikovanihRizika: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper type for any database row
export type DbRow = Record<string, unknown>;
