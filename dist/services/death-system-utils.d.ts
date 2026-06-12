import type { Language } from '../lib/i18n.js';
export declare function t3(lang: Language, es: string, en: string, ru: string): string;
export declare function toNumber(value: unknown, fallback?: number): number;
export declare function toMillis(value: Date | string | null | undefined): number;
export declare function hashSeed(input: string): number;
export declare function pickOffset(min: number, max: number, seed: string): number;
export declare function getCellCoords(x: number, y: number, cellSize?: number): {
    cellX: number;
    cellY: number;
};
