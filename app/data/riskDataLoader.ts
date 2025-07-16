import { RiskGroupData } from './riskGroups';
import { GROUP1_DATA } from './group1Data';
import { GROUP2_DATA } from './group2Data';
import { GROUP3_DATA } from './group3Data';
import { GROUP4_DATA } from './group4Data';
import { GROUP5_DATA } from './group5Data';
import { GROUP6_DATA } from './group6Data';
import { GROUP7_DATA } from './group7Data';
import { GROUP8_DATA } from './group8Data';
import { GROUP9_DATA } from './group9Data';
import { GROUP10_DATA } from './group10Data';
import { GROUP11_DATA } from './group11Data';

// Funkcija za učitavanje podataka grupe rizika
export function getRiskGroupData(groupId: string): RiskGroupData | null {
    switch (groupId) {
        case 'group1':
            return GROUP1_DATA;
        case 'group2':
            return GROUP2_DATA;
        case 'group3':
            return GROUP3_DATA;
        case 'group4':
            return GROUP4_DATA;
        case 'group5':
            return GROUP5_DATA;
        case 'group6':
            return GROUP6_DATA;
        case 'group7':
            return GROUP7_DATA;
        case 'group8':
            return GROUP8_DATA;
        case 'group9':
            return GROUP9_DATA;
        case 'group10':
            return GROUP10_DATA;
        case 'group11':
            return GROUP11_DATA;
        default:
            return null;
    }
}