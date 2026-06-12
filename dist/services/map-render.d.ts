import { InlineKeyboard } from 'grammy';
export interface MapRenderResult {
    header: string;
    biomeName: string;
    grid: string;
    footer: string;
    keyboard: InlineKeyboard;
}
export declare function renderMap(tgId: string): Promise<MapRenderResult | null>;
