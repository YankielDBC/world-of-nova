// @ts-nocheck
const DEFAULT_TRUNCATE_SUFFIX = '...';
const NAME_ABBREVIATIONS = [
    [/\bHojas de Viento\b/gi, 'H. de viento'],
    [/\bHojas de\b/gi, 'H. de'],
    [/\bHacha de\b/gi, 'H. de'],
    [/\bPico de\b/gi, 'P. de'],
    [/\bTijera de\b/gi, 'T. de'],
    [/\bEspada de\b/gi, 'Esp. de'],
    [/\bMartillo de\b/gi, 'Mart. de'],
    [/\bArmadura de\b/gi, 'Arm. de'],
    [/\bGuantes de\b/gi, 'Gts. de'],
    [/\bBotas de\b/gi, 'Bts. de'],
    [/\bDoble\b/gi, 'Dbl.'],
    [/\bMadera\b/gi, 'Mad.'],
    [/\bPiedra\b/gi, 'Pdr.'],
];
export const TELEGRAM_PHONE_LINE_LIMIT = 30;
export function compactText(value, maxChars, suffix = DEFAULT_TRUNCATE_SUFFIX) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars) {
        return normalized;
    }
    const safeMax = Math.max(1, maxChars);
    if (safeMax <= suffix.length) {
        return normalized.slice(0, safeMax);
    }
    return `${normalized.slice(0, safeMax - suffix.length)}${suffix}`;
}
export function abbreviateName(value) {
    let output = value.replace(/\s+/g, ' ').trim();
    for (const [pattern, replacement] of NAME_ABBREVIATIONS) {
        output = output.replace(pattern, replacement);
    }
    return output;
}
export function compactLabel(value, maxChars) {
    const abbreviated = abbreviateName(value);
    if (abbreviated.length <= maxChars) {
        return abbreviated;
    }
    return compactText(abbreviated, maxChars, '');
}
export function compactCoordLabel(x, y) {
    return `(${x}, ${y})`;
}
export function clampLine(line, _maxChars = TELEGRAM_PHONE_LINE_LIMIT) {
    return line;
}
export function fitCardLines(lines, _maxChars = TELEGRAM_PHONE_LINE_LIMIT) {
    return lines.join('\n').trim();
}
