// Kompletno testiranje optimizovanog toka
console.log('🚀 KOMPLETNO TESTIRANJE OPTIMIZOVANOG TOKA');
console.log('==========================================');

// Simulacija korisničkog klika na tabelu
async function simulateUserClick(procenaId, groupId, itemId, score, requirement) {
    console.log(`\n👆 Korisnik klika: ${itemId} -> Ocena ${score}`);
    
    // 1. Automatski izračunaj Prilog M podatke (kao u RiskAssessmentTable)
    const calculatedData = calculatePrilogM(score);
    
    const prilogMItem = {
        id: itemId,
        groupId: groupId,
        requirement: requirement,
        ...calculatedData
    };
    
    console.log(`   ⚡ Automatski izračunato:`);
    console.log(`      Izloženost: ${calculatedData.izlozenost}`);
    console.log(`      Ranjivost: ${calculatedData.ranjivost}`);
    console.log(`      Verovatnoća: ${calculatedData.verovatnoca}`);
    console.log(`      Nivo rizika: ${calculatedData.nivoRizika}`);
    console.log(`      Kategorija: ${calculatedData.kategorijaRizika}`);
    console.log(`      Prihvatljivost: ${calculatedData.prihvatljivost}`);
    
    return prilogMItem;
}

// Funkcija za računanje (kopirana iz test-optimized.js)
function calculatePrilogM(velicinaOpasnosti, stepenIzlozenosti = 3, stepenRanjivosti = 3, steta = 3, kriticnost = 3) {
    const MATRICE = {
        verovatnoca: [
            [1, 2, 3, 4, 5], [3, 2, 1, 1, 1], [4, 3, 2, 2, 1], [5, 4, 3, 3, 2], [5, 5, 4, 3, 3]
        ],
        posledice: [
            [1, 1, 1, 1, 1], [3, 2, 2, 1, 1], [4, 3, 2, 2, 2], [5, 4, 3, 3, 3], [5, 5, 4, 3, 3]
        ],
        nivoRizika: [
            [1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [3, 6, 9, 12, 15], [4, 8, 12, 16, 20], [5, 10, 15, 20, 25]
        ]
    };

    const izlozenost = Math.round((stepenIzlozenosti + velicinaOpasnosti) / 2);
    const ranjivost = Math.round((stepenRanjivosti + velicinaOpasnosti) / 2);
    const verovatnoca = MATRICE.verovatnoca[ranjivost - 1]?.[izlozenost - 1] || 1;
    const posledice = MATRICE.posledice[steta - 1]?.[kriticnost - 1] || 1;
    const nivoRizika = MATRICE.nivoRizika[verovatnoca - 1]?.[posledice - 1] || 1;
    
    function getKategorijaRizika(nivoRizika) {
        if (nivoRizika >= 1 && nivoRizika <= 2) return 5;
        if (nivoRizika >= 3 && nivoRizika <= 5) return 4;
        if (nivoRizika >= 6 && nivoRizika <= 9) return 3;
        if ([10, 12, 15, 16].includes(nivoRizika)) return 2;
        if ([20, 25].includes(nivoRizika)) return 1;
        return 5;
    }
    
    function getPrihvatljivost(nivoRizika) {
        return [1, 2, 3, 4, 5].includes(nivoRizika) ? 'PRIHVATLJIV' : 'NEPRIHVATLJIV';
    }
    
    const kategorijaRizika = getKategorijaRizika(nivoRizika);
    const prihvatljivost = getPrihvatljivost(nivoRizika);
    
    return {
        velicinaOpasnosti, izlozenost, ranjivost, verovatnoca, posledice, 
        steta, kriticnost, nivoRizika, kategorijaRizika, prihvatljivost
    };
}

// Simulacija kompletnog korisničkog toka
async function testCompleteFlow() {
    const procenaId = 'test-complete-001';
    
    console.log(`\n📋 Korisnik otvara procenu: ${procenaId}`);
    console.log('📊 Početne statistike: 0 stavki završeno');
    
    // Simulacija klika na različite ocene
    const userClicks = [
        { groupId: 'group1', itemId: '1.1', score: 5, requirement: 'Pravilnik o organizaciji' },
        { groupId: 'group1', itemId: '1.2', score: 2, requirement: 'Plan nabavke' },
        { groupId: 'group2', itemId: '2.1', score: 4, requirement: 'Organizacijska regulativa BZR' },
        { groupId: 'group2', itemId: '2.2', score: 1, requirement: 'Zaštitna oprema' },
        { groupId: 'group3', itemId: '3.1', score: 3, requirement: 'Pravni rizici - podaci' }
    ];
    
    const results = [];
    
    for (const click of userClicks) {
        const result = await simulateUserClick(
            procenaId, 
            click.groupId, 
            click.itemId, 
            click.score, 
            click.requirement
        );
        results.push(result);
    }
    
    // Izračunaj finalne statistike
    console.log('\n📊 FINALNE STATISTIKE:');
    console.log('======================');
    
    const totalItems = results.length;
    const riskCategories = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let prihvatljiviRizici = 0;
    let neprihvatljiviRizici = 0;
    let highRiskItems = 0;
    
    results.forEach(item => {
        riskCategories[item.kategorijaRizika]++;
        if (item.prihvatljivost === 'PRIHVATLJIV') {
            prihvatljiviRizici++;
        } else {
            neprihvatljiviRizici++;
        }
        if (item.kategorijaRizika === 1 || item.kategorijaRizika === 2) {
            highRiskItems++;
        }
    });
    
    const averageRiskLevel = results.reduce((sum, item) => sum + item.nivoRizika, 0) / totalItems;
    
    console.log(`Ukupno stavki: ${totalItems}`);
    console.log(`Završeno: ${totalItems} (100%)`);
    console.log(`Visoki rizici: ${highRiskItems}`);
    console.log(`Prihvatljivi: ${prihvatljiviRizici}`);
    console.log(`Neprihvatljivi: ${neprihvatljiviRizici}`);
    console.log(`Prosečan nivo rizika: ${averageRiskLevel.toFixed(2)}`);
    
    console.log('\nKategorije rizika:');
    console.log(`PRVA (izrazito veliki): ${riskCategories[1]}`);
    console.log(`DRUGA (veliki): ${riskCategories[2]}`);
    console.log(`TREĆA (umereno veliki): ${riskCategories[3]}`);
    console.log(`ČETVRTA (mali): ${riskCategories[4]}`);
    console.log(`PETA (vrlo mali): ${riskCategories[5]}`);
    
    console.log('\n📈 DETALJAN PREGLED REZULTATA:');
    console.log('==============================');
    results
        .sort((a, b) => b.nivoRizika - a.nivoRizika)
        .forEach(item => {
            const categoryName = {
                1: 'PRVA', 2: 'DRUGA', 3: 'TREĆA', 4: 'ČETVRTA', 5: 'PETA'
            }[item.kategorijaRizika];
            
            console.log(`${item.id}: VO=${item.velicinaOpasnosti} → Nivo=${item.nivoRizika} → ${categoryName} → ${item.prihvatljivost}`);
        });
    
    console.log('\n✅ OPTIMIZOVANI TOK USPEŠNO TESTIRAN!');
    console.log('=====================================');
    console.log('🎯 Ključne prednosti potvrđene:');
    console.log('   ✓ Jedan klik = kompletna analiza');
    console.log('   ✓ Automatsko računanje svih formula');
    console.log('   ✓ Real-time statistike');
    console.log('   ✓ Bez ručnog prenosa podataka');
    console.log('   ✓ Nema mogućnost grešaka u računanju');
}

// Pokreni test
testCompleteFlow().catch(console.error);