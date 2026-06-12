import { kvDel, kvGetJson, kvSetJson } from './distributed-kv.js';
const DEFAULT_TTL_SECONDS = 30 * 60;
function toKey(playerTgId, scope) {
    return `${scope}:${playerTgId}`;
}
export async function getConversationState(scope, playerTgId) {
    return kvGetJson('conversation', toKey(playerTgId, scope));
}
export async function setConversationState(scope, playerTgId, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    await kvSetJson('conversation', toKey(playerTgId, scope), value, ttlSeconds);
}
export async function clearConversationState(scope, playerTgId) {
    await kvDel('conversation', toKey(playerTgId, scope));
}
