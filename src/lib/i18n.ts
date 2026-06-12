// @ts-nocheck
// ============================================
// WORLD OF NOVA - INTERNATIONALIZATION (i18n)
// Supported: Spanish (es), English (en), Russian (ru)
// ============================================
export const SUPPORTED_LANGUAGES = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇬🇧' },
    ru: { name: 'Русский', flag: '🇷🇺' },
};
import { translations } from './i18n/translations.js';
// ============================================
// TRANSLATION FUNCTION
// ============================================
/**
 * Get translation by key and language
 */
export function t(lang, key, params) {
    const translation = translations[lang][key] || translations['en'][key] || key;
    if (!params)
        return translation;
    // Replace placeholders like {nickname} with actual values
    return translation.replace(/\{(\w+)\}/g, (_, paramKey) => String(params[paramKey] ?? `{${paramKey}}`));
}
/**
 * Detect language from Telegram language code
 * Telegram provides: "es", "en", "ru", "uk", etc.
 */
export function detectLanguage(tgLanguageCode) {
    if (!tgLanguageCode)
        return 'es'; // Default to Spanish
    const code = tgLanguageCode.toLowerCase().split('-')[0]; // "es-MX" -> "es"
    if (code === 'es')
        return 'es';
    if (code === 'en')
        return 'en';
    if (code === 'ru')
        return 'ru';
    return 'es'; // Default
}
/**
 * Validate if language is supported
 */
export function isValidLanguage(lang) {
    return lang in SUPPORTED_LANGUAGES;
}
