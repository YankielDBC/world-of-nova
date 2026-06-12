export declare const CUSTOM_EMOJI_FIXED_BY_TEXT: Record<string, string>;
export declare const CUSTOM_EMOJI_VARIANTS_BY_TEXT: Record<string, string[]>;
export declare const CUSTOM_EMOJI_TOKENS_SORTED: string[];
export declare function hasCustomEmojiToken(token: string): boolean;
export declare function summarizeCustomEmojiTokenCoverage(tokens: Iterable<string>): {
    supported: string[];
    pending: string[];
};
