// Definicija tipova za risk podatke
export interface RiskLevel {
    5: string;
    4: string;
    3: string;
    2: string;
    1: string;
}

export interface RiskItem {
    id: string;
    levels: RiskLevel;
}

export interface RiskGroup {
    id: string;
    title: string;
    items: RiskItem[];
}

export interface RiskGroupData {
    id: string;
    name: string;
    description: string;
    risks: RiskGroup[];
}

// Lista svih grupa rizika
export const RISK_GROUPS: { id: string; name: string; description: string }[] = [
    { id: "group1", name: "Прилог В (нормативан)", description: "Критеријум за идентификацију ризика општих пословних активности" },
    { id: "group2", name: "Прилог Г (нормативан)", description: "Критеријум за идентификацију ризика по безбедност и здравље на раду" },
    { id: "group3", name: "Прилог Д (нормативан)", description: "Критеријум за идентификацију правних ризика" },
    { id: "group4", name: "Прилог Ђ (нормативан)", description: "Критеријум за идентификацију ризика од противправног деловања" },
    { id: "group5", name: "Прилог Е (нормативан)", description: "Критеријум за идентификацију ризика од пожара" },
    { id: "group6", name: "Прилог Ж (нормативан)", description: "Критеријум за идентификацију ризика од елементарних непогода и других несрећа" },
    { id: "group7", name: "Прилог З (нормативан)", description: "Критеријум за идентификацију ризика од експлозија" },
    { id: "group8", name: "Прилог И (нормативан)", description: "Критеријум за идентификацију ризика од неусаглашености са стандардима" },
    { id: "group9", name: "Прилог Ј (нормативан)", description: "Критеријуми за идентификацију ризика по животну средину" },
    { id: "group10", name: "Прилог К (нормативан)", description: "Критеријуми за идентификацију ризика у управљању људским ресурсима" },
    { id: "group11", name: "Прилог Л (нормативан)", description: "Критеријуми за идентификацију ризика у области информационо-комуникационо-телекомуникационих система" }
];