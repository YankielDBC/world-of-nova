import { type Language } from '../lib/i18n.js';
export declare function getMapSituationNotice(lang: Language, footer: string): string;
export declare function renderMapCardText(mapResult: {
    header: string;
    biomeName: string;
    grid: string;
    footer: string;
}, lang: Language): string;
