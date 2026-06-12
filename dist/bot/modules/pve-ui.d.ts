import { InlineKeyboard } from 'grammy';
export declare function renderPveCombatText(view: any, lang: any, infoLine: any): string;
export declare function renderPveAbilityMenu(view: any, lang: any, kind: any, infoLine: any): string;
export declare function buildPveCombatKeyboard(lang: any): InlineKeyboard;
export declare function buildPveAbilityKeyboard(view: any, lang: any, kind: any): InlineKeyboard;
export declare function buildPveScoutKeyboard(lang: any, creatureId: any): InlineKeyboard;
export declare function buildPveOutcomeKeyboard(lang: any): InlineKeyboard;
export declare function buildPveBlockedKeyboard(lang: any): InlineKeyboard;
