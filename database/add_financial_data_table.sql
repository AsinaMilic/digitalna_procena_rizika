-- Tabela za finansijske podatke potrebne za kalkulacije
CREATE TABLE IF NOT EXISTS FinancialData (
    id SERIAL PRIMARY KEY,
    procenaId INTEGER NOT NULL REFERENCES ProcenaRizika(id) ON DELETE CASCADE,
    poslovniPrihodi BIGINT NOT NULL DEFAULT 1000000, -- AOP 1001 iz bilansa
    vrednostImovine BIGINT NOT NULL DEFAULT 5000000, -- SVnpoz - sadašnja vrednost nekretina, postrojenja, opreme i zaliha
    delatnost VARCHAR(100) NOT NULL DEFAULT 'default', -- Tip delatnosti za Iud
    stvarnaSteta BIGINT NOT NULL DEFAULT 0, -- Evidentirana šteta u protekle 3 godine
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Jedinstveni constraint - jedna procena može imati samo jedan set finansijskih podataka
    UNIQUE(procenaId)
);

-- Indeks za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_financial_data_procena ON FinancialData(procenaId);

-- Komentar za tabelu
COMMENT ON TABLE FinancialData IS 'Finansijski podaci potrebni za tačne kalkulacije prema SRPS A.L2.003:2025';
COMMENT ON COLUMN FinancialData.poslovniPrihodi IS 'Poslovni prihodi (AOP 1001) iz poslednjeg bilansa uspеha';
COMMENT ON COLUMN FinancialData.vrednostImovine IS 'Sadašnja vrednost nekretina, postrojenja, opreme i zaliha (SVnpoz)';
COMMENT ON COLUMN FinancialData.delatnost IS 'Tip delatnosti za određivanje indeksa uticaja delatnosti (Iud)';
COMMENT ON COLUMN FinancialData.stvarnaSteta IS 'Evidentirana šteta u protekle 3 godine za kalkulaciju SŠ';