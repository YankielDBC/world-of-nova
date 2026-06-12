// @ts-nocheck
// Centralized custom emoji index for Telegram entities.
// Keys are placeholder Unicode emoji present in outgoing text.
// Values are Telegram custom_emoji_id.
export const CUSTOM_EMOJI_FIXED_BY_TEXT = {
    '🪓': '5069028648799963318',
    '⛏️': '5068848526461503342',
    '🪵': '5067052319598709697',
    '💼': '5069287708342355188',
    '👖': '5069287708342355188',
    '🎒': '5069287708342355188',
    '✂️': '5066936664719361709',
    '🌰': '5069172001923401704',
    '🎋': '5066883767902144226',
    '🥥': '5066927387590003526',
    '🍎': '5069177722819840087',
    '🍊': '5068901509178066608',
    '📈': '5165862771002180910',
    '📚': '5167996321776272381',
    '📜': '5165753601523451094',
    '📊': '5165659382825878623',
    '🧬': '5165646300355495704',
    '🦶': '5168123070556145201',
    '📖': '5165727973453595870',
    '⚡️': '5168190462887986790',
    '⚡': '5168190462887986790',
    '💚': '5165950238011163919',
    '🧙‍♂️': '5168326652005975551',
    '💪': '5168438497249330537',
    '🐾': '5165925812532151569',
    '🌀': '5168406912059835608',
    '🔋': '5165953875848463643',
    '🗡': '5165824889390630302',
    '💢': '5165722364226307212',
    '🤸‍♀️': '5167912531259294806',
    '🎣': '5069171228829288104',
    '💧': '5069080519119996627',
    '🌽': '5068804279708419505',
    '🌲': '5069199021562660674',
    '💰': '5069264201986344730',
};
export const CUSTOM_EMOJI_VARIANTS_BY_TEXT = {
    // Plains biome rotation
    '🌾': ['5069062488847288417', '5069226539418126436', '5068859070606214795'],
    // Forest non-pine / dead-tree variants
    '🌳': [
        '5069105524419593866',
        '5069175764314752381',
        '5066857465522423673',
        '5069085711735457279',
        '5068849101987120768',
    ],
    // Coconut tree variants (fixed set for palm node in forest)
    '🌴': ['5073399151685797331', '5071093763565160119'],
    '🌵': [
        '5069105524419593866',
        '5069175764314752381',
        '5066857465522423673',
        '5069085711735457279',
        '5068849101987120768',
    ],
    '🪾': [
        '5069105524419593866',
        '5069175764314752381',
        '5066857465522423673',
        '5069085711735457279',
        '5068849101987120768',
    ],
    // Volcano biome rotation
    '🌋': ['5069226638202376031', '5068953929253914701'],
};
export const CUSTOM_EMOJI_TOKENS_SORTED = [
    ...Object.keys(CUSTOM_EMOJI_FIXED_BY_TEXT),
    ...Object.keys(CUSTOM_EMOJI_VARIANTS_BY_TEXT),
].sort((a, b) => b.length - a.length);
const CUSTOM_EMOJI_TOKEN_SET = new Set(CUSTOM_EMOJI_TOKENS_SORTED);
export function hasCustomEmojiToken(token) {
    return CUSTOM_EMOJI_TOKEN_SET.has(token);
}
export function summarizeCustomEmojiTokenCoverage(tokens) {
    const supported = [];
    const pending = [];
    const seen = new Set();
    for (const token of tokens) {
        const normalized = String(token || '').trim();
        if (!normalized || seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        if (CUSTOM_EMOJI_TOKEN_SET.has(normalized)) {
            supported.push(normalized);
        }
        else {
            pending.push(normalized);
        }
    }
    return {
        supported: supported.sort(),
        pending: pending.sort(),
    };
}
//# sourceMappingURL=custom-emojis.js.map