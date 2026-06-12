export declare const SUPPORTED_LANGUAGES: {
    es: {
        name: string;
        flag: string;
    };
    en: {
        name: string;
        flag: string;
    };
    ru: {
        name: string;
        flag: string;
    };
};
/**
 * Get translation by key and language
 */
export declare function t(lang: any, key: any, params: any): any;
/**
 * Detect language from Telegram language code
 * Telegram provides: "es", "en", "ru", "uk", etc.
 */
export declare function detectLanguage(tgLanguageCode: any): "en" | "es" | "ru";
/**
 * Validate if language is supported
 */
export declare function isValidLanguage(lang: any): boolean;
