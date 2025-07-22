-- Dodavanje nedostajućih kolona u PrilogM tabelu
-- Ova skripta dodaje kolone potrebne za potpunu implementaciju SRPS A.L2.003:2025 standarda

-- Proverava da li kolone već postoje pre dodavanja
DO $$
BEGIN
    -- Dodaj stepenIzlozenosti kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'stepenizlozenosti') THEN
        ALTER TABLE PrilogM ADD COLUMN stepenIzlozenosti INTEGER DEFAULT 3;
        RAISE NOTICE 'Dodana kolona stepenIzlozenosti';
    END IF;

    -- Dodaj stepenRanjivosti kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'stepenranjivosti') THEN
        ALTER TABLE PrilogM ADD COLUMN stepenRanjivosti INTEGER DEFAULT 3;
        RAISE NOTICE 'Dodana kolona stepenRanjivosti';
    END IF;

    -- Dodaj stvarnaSteta kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'stvarnasteta') THEN
        ALTER TABLE PrilogM ADD COLUMN stvarnaSteta DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Dodana kolona stvarnaSteta';
    END IF;

    -- Dodaj poslovniPrihodi kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'poslovniprihodi') THEN
        ALTER TABLE PrilogM ADD COLUMN poslovniPrihodi DECIMAL(15,2) DEFAULT 1000000;
        RAISE NOTICE 'Dodana kolona poslovniPrihodi';
    END IF;

    -- Dodaj vrednostImovine kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'vrednostimovine') THEN
        ALTER TABLE PrilogM ADD COLUMN vrednostImovine DECIMAL(15,2) DEFAULT 5000000;
        RAISE NOTICE 'Dodana kolona vrednostImovine';
    END IF;

    -- Dodaj delatnost kolonu ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'delatnost') THEN
        ALTER TABLE PrilogM ADD COLUMN delatnost VARCHAR(50) DEFAULT 'default';
        RAISE NOTICE 'Dodana kolona delatnost';
    END IF;

    -- Proverava da li stepenSS kolona postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'stepenss') THEN
        ALTER TABLE PrilogM ADD COLUMN stepenSS INTEGER DEFAULT 1;
        RAISE NOTICE 'Dodana kolona stepenSS';
    END IF;

    -- Proverava da li stepenVMSH kolona postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'stepenvmsh') THEN
        ALTER TABLE PrilogM ADD COLUMN stepenVMSH INTEGER DEFAULT 1;
        RAISE NOTICE 'Dodana kolona stepenVMSH';
    END IF;

    -- Proverava da li vmshIznos kolona postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prilogm' AND column_name = 'vmshiznos') THEN
        ALTER TABLE PrilogM ADD COLUMN vmshIznos DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Dodana kolona vmshIznos';
    END IF;

END $$;

-- Dodaj komentare za bolje razumevanje kolona
COMMENT ON COLUMN PrilogM.stepenIzlozenosti IS 'Stepen izloženosti prema SRPS A.L2.003:2025 (1-5)';
COMMENT ON COLUMN PrilogM.stepenRanjivosti IS 'Stepen ranjivosti prema SRPS A.L2.003:2025 (1-5)';
COMMENT ON COLUMN PrilogM.stvarnaSteta IS 'Stvarna šteta u RSD';
COMMENT ON COLUMN PrilogM.poslovniPrihodi IS 'Poslovni prihodi u RSD';
COMMENT ON COLUMN PrilogM.vrednostImovine IS 'Vrednost imovine u RSD';
COMMENT ON COLUMN PrilogM.delatnost IS 'Tip delatnosti za kalkulaciju uticaja';
COMMENT ON COLUMN PrilogM.stepenSS IS 'Stepen stvarne štete (1-5)';
COMMENT ON COLUMN PrilogM.stepenVMSH IS 'Stepen verovatno maksimalne štete (1-5)';
COMMENT ON COLUMN PrilogM.vmshIznos IS 'Iznos verovatno maksimalne štete u RSD';

-- Prikaži strukturu tabele nakon izmena
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'prilogm' 
ORDER BY ordinal_position;