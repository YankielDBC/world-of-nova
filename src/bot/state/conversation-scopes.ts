// @ts-nocheck
export function createConversationScopes(deps) {
    const ttlSeconds = deps.ttlSeconds ?? 30 * 60;
    const ventureScope = 'venture';
    const bagScope = 'bag';
    const inspectScope = 'inspect';
    return {
        getVentureState: (playerTgId) => deps.getConversationState(ventureScope, playerTgId),
        setVentureState: (playerTgId, state) => deps.setConversationState(ventureScope, playerTgId, state, ttlSeconds),
        clearVentureState: (playerTgId) => deps.clearConversationState(ventureScope, playerTgId),
        getBagState: (playerTgId) => deps.getConversationState(bagScope, playerTgId),
        setBagState: (playerTgId, state) => deps.setConversationState(bagScope, playerTgId, state, ttlSeconds),
        clearBagState: (playerTgId) => deps.clearConversationState(bagScope, playerTgId),
        getInspectState: (playerTgId) => deps.getConversationState(inspectScope, playerTgId),
        setInspectState: (playerTgId, state) => deps.setConversationState(inspectScope, playerTgId, state, ttlSeconds),
        clearInspectState: (playerTgId) => deps.clearConversationState(inspectScope, playerTgId),
    };
}
