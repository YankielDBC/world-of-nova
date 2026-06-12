export declare const SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG = "__skip_custom_emoji_transformer";
export declare function buildCustomEmojiEntitiesForText(text: any, existingEntities?: any[]): any[];
export declare function buildCustomEmojiHtmlFromEntities(text: any, entities: any): any;
export declare function buildCustomEmojiHtmlForText(text: any): any;
export declare function clampCustomEmojiEntitiesForMessage(entities: any): any;
export declare function registerBlockedCustomEmojiId(customEmojiId: any): void;
export declare function primeCustomEmojiAvailability(bot: any): Promise<void>;
export declare function installCustomEmojiTransformer(bot: any): void;
