-- Dodavanje novih kolona za pravna lica
-- Ova skripta dodaje sve potrebne podatke za pravna lica prema zahtevima

ALTER TABLE PravnoLice 
ADD COLUMN IF NOT EXISTS skraceno_poslovno_ime VARCHAR(255),
ADD COLUMN IF NOT EXISTS adresa_sediste VARCHAR(500),
ADD COLUMN IF NOT EXISTS adresa_ostala TEXT, -- Za adrese ogranaka i ostalih funkcionalnih celina
ADD COLUMN IF NOT EXISTS sifra_delatnosti VARCHAR(20),
ADD COLUMN IF NOT EXISTS maticni_broj VARCHAR(20),
ADD COLUMN IF NOT EXISTS pib VARCHAR(20), -- PIB broj
ADD COLUMN IF NOT EXISTS lice_zastupanje TEXT, -- Lice odgovorno za zastupanje
ADD COLUMN IF NOT EXISTS lice_komunikacija TEXT, -- Lice ovlašćeno za komunikaciju
ADD COLUMN IF NOT EXISTS tim_procena_rizika TEXT, -- Podaci o licima iz tima (JSON ili text)
ADD COLUMN IF NOT EXISTS telefon_faks VARCHAR(100),
ADD COLUMN IF NOT EXISTS internet_adresa VARCHAR(255);

-- Dodavanje komentara za bolje razumevanje
COMMENT ON COLUMN PravnoLice.naziv IS 'Poslovno ime (pun naziv)';
COMMENT ON COLUMN PravnoLice.skraceno_poslovno_ime IS 'Skraćeno poslovno ime';
COMMENT ON COLUMN PravnoLice.adresa IS 'Stara kolona - zadržana za kompatibilnost';
COMMENT ON COLUMN PravnoLice.adresa_sediste IS 'Adresa sedišta';
COMMENT ON COLUMN PravnoLice.adresa_ostala IS 'Adrese ogranaka, izdvojenih mesta i ostalih funkcionalnih celina';
COMMENT ON COLUMN PravnoLice.sifra_delatnosti IS 'Šifra delatnosti';
COMMENT ON COLUMN PravnoLice.maticni_broj IS 'Matični broj';
COMMENT ON COLUMN PravnoLice.pib IS 'PIB broj';
COMMENT ON COLUMN PravnoLice.lice_zastupanje IS 'Lice odgovorno za zastupanje';
COMMENT ON COLUMN PravnoLice.lice_komunikacija IS 'Lice ovlašćeno za komunikaciju u vezi procenom rizika';
COMMENT ON COLUMN PravnoLice.tim_procena_rizika IS 'Podaci o licima iz tima za procenu rizika (ime, prezime, stručna sprema)';
COMMENT ON COLUMN PravnoLice.telefon_faks IS 'Broj telefona / faksa';
COMMENT ON COLUMN PravnoLice.internet_adresa IS 'Internet adresa (website)';

-- Kreiranje indeksa za bolje performanse
CREATE INDEX IF NOT EXISTS idx_pravno_lice_maticni_broj ON PravnoLice(maticni_broj);
CREATE INDEX IF NOT EXISTS idx_pravno_lice_pib ON PravnoLice(pib);
CREATE INDEX IF NOT EXISTS idx_pravno_lice_sifra_delatnosti ON PravnoLice(sifra_delatnosti);