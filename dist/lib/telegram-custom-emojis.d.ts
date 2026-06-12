import type { Bot, Context } from 'grammy';
type EntityLike = {
    offset: number;
    length: number;
    type: string;
    custom_emoji_id?: string;
};
export type TelegramEntityLike = EntityLike;
export declare const SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG = "__skip_custom_emoji_transformer";
export declare function buildCustomEmojiEntitiesForText(text: string, existingEntities?: TelegramEntityLike[]): TelegramEntityLike[];
export declare function buildCustomEmojiHtmlFromEntities(text: string, entities: TelegramEntityLike[]): string;
export declare function buildCustomEmojiHtmlForText(text: string): string;
export declare function clampCustomEmojiEntitiesForMessage(entities: TelegramEntityLike[]): TelegramEntityLike[];
export declare function registerBlockedCustomEmojiId(customEmojiId: string): void;
export declare function primeCustomEmojiAvailability(bot: Bot<Context>): Promise<void>;
export declare function installCustomEmojiTransformer(bot: Bot<Context>): void;
export {};
