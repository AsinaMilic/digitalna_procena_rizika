export interface PrilogFData {
    id: number;
    procena_id: number;
    f1_podaci_o_organizaciji: string;
    f1_menadzer_rizika: string;

    f2_podaci_o_posmatranoj_org: string;
    f2_sifra_delatnosti: string;
    f2_odgovorno_lice: string;
    f2_podaci_o_licima: string;

    f3_eksterni_kontekst: {
        pravni_okvir: string;
        ekonomsko_okruzenje: string;
        tehnoloski_razvoj: string;
        drustveno_okruzenje: string;
    };
    f3_interni_kontekst: {
        istorija_stetnih_dogadjaja: string;
        velicina_org_uticaj: string;
        nacin_organizovanja: string;
        nacin_stepen_zastite: string;
        delovanje_zainteresovanih: string;
    };

    f4_identifikacija: string; // Simplified for now, can be complex obj if needed but screenshots look like free text or reference to other headers
    f4_analiza: string;
    f4_vrednovanje: string; // JSONB
    f6_zakljucak: {
        tacka_1: string;
        tacka_2: string;
        tacka_3: string;
        tacka_4: string;
        tacka_5: string;
    };
}

export const INITIAL_PRILOG_F_DATA: PrilogFData = {
    id: 0,
    procena_id: 0,
    f1_podaci_o_organizaciji: '',
    f1_menadzer_rizika: '',
    f2_podaci_o_posmatranoj_org: '',
    f2_sifra_delatnosti: '',
    f2_odgovorno_lice: '',
    f2_podaci_o_licima: '',
    f3_eksterni_kontekst: {
        pravni_okvir: '',
        ekonomsko_okruzenje: '',
        tehnoloski_razvoj: '',
        drustveno_okruzenje: ''
    },
    f3_interni_kontekst: {
        istorija_stetnih_dogadjaja: '',
        velicina_org_uticaj: '',
        nacin_organizovanja: '',
        nacin_stepen_zastite: '',
        delovanje_zainteresovanih: ''
    },
    f4_identifikacija: '',
    f4_analiza: '',
    f4_vrednovanje: '',
    f6_zakljucak: {
        tacka_1: '',
        tacka_2: '',
        tacka_3: '',
        tacka_4: '',
        tacka_5: ''
    }
};
