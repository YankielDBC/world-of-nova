export function asStringPlayerTgIdGetter(fn) {
    return (playerTgId) => fn(String(playerTgId));
}
export function asStringPlayerTgIdSetter(fn) {
    return (playerTgId, state) => fn(String(playerTgId), state);
}
export function asLanguageArg(fn) {
    return (...args) => fn(...args);
}
export function asOptionalLanguageSecondArg(fn) {
    return (first, lang) => fn(first, lang);
}
export function asOptionalLanguageThirdArg(fn) {
    return (first, second, lang) => fn(first, second, lang);
}
