import type { Language } from '../lib/i18n.js';
export type CustomPlaceInteractionResult = {
    handled: boolean;
    success?: boolean;
    errorMessage?: string;
    effectMessage?: string;
    extraLines?: string[];
    currencyLine?: string;
};
export declare function executeCustomPlaceInteraction(params: {
    playerId: number;
    tgId: string;
    placeId?: number;
    interaction: {
        slug: string;
        costType: string | null;
        costAmount: number | null;
    };
    lang: Language;
}): Promise<CustomPlaceInteractionResult>;
