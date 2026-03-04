-- Performance indexes for Azure SQL Database
-- Run this in Azure SQL Query Editor to speed up queries

-- PravnoLice table indexes
CREATE NONCLUSTERED INDEX IX_PravnoLice_PIB ON PravnoLice(pib);
CREATE NONCLUSTERED INDEX IX_PravnoLice_MaticniBroj ON PravnoLice(maticni_broj);

-- ProcenaRizika table indexes
CREATE NONCLUSTERED INDEX IX_ProcenaRizika_PravnoLiceId ON ProcenaRizika(pravnoLiceId);
CREATE NONCLUSTERED INDEX IX_ProcenaRizika_Status ON ProcenaRizika(status);

-- Usluge table indexes
CREATE NONCLUSTERED INDEX IX_Usluge_PravnoLiceId ON Usluge(pravnoLiceId);

-- PrilogM table indexes
CREATE NONCLUSTERED INDEX IX_PrilogM_ProcenaId ON PrilogM(procenaId);

-- FinancialData table indexes
CREATE NONCLUSTERED INDEX IX_FinancialData_ProcenaId ON FinancialData(procenaId);

-- RiskSelection table indexes
CREATE NONCLUSTERED INDEX IX_RiskSelection_ProcenaId ON RiskSelection(procenaId);

-- PrilogMSections table indexes
CREATE NONCLUSTERED INDEX IX_PrilogMSections_ProcenaId ON PrilogMSections(procenaId);

-- PrilogMSummary table indexes
CREATE NONCLUSTERED INDEX IX_PrilogMSummary_ProcenaId ON PrilogMSummary(procenaId);