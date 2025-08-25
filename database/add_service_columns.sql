-- Dodavanje kolona za naziv usluge i datum izrade u tabelu ProcenaRizika
ALTER TABLE ProcenaRizika ADD COLUMN IF NOT EXISTS naziv_usluge TEXT;
ALTER TABLE ProcenaRizika ADD COLUMN IF NOT EXISTS datum_izrade DATE;

-- Dodaj komentare za bolje razumevanje kolona
COMMENT ON COLUMN ProcenaRizika.naziv_usluge IS 'Naziv usluge koja je urađena za ovu procenu rizika';
COMMENT ON COLUMN ProcenaRizika.datum_izrade IS 'Datum kada je procena rizika završena/izradjena';

-- Prikaži strukturu tabele nakon izmena
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'procenarizika' 
ORDER BY ordinal_position;