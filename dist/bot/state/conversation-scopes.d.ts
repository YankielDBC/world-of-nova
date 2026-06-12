type StateStoreGet = (scope: string, playerTgId: string) => Promise<any>;
type StateStoreSet = (scope: string, playerTgId: string, state: unknown, ttlSeconds?: number) => Promise<void>;
type StateStoreClear = (scope: string, playerTgId: string) => Promise<void>;
interface ConversationScopesDeps {
    getConversationState: StateStoreGet;
    setConversationState: StateStoreSet;
    clearConversationState: StateStoreClear;
    ttlSeconds?: number;
}
export declare function createConversationScopes(deps: ConversationScopesDeps): {
    getVentureState: (playerTgId: string) => Promise<any>;
    setVentureState: (playerTgId: string, state: unknown) => Promise<void>;
    clearVentureState: (playerTgId: string) => Promise<void>;
    getBagState: (playerTgId: string) => Promise<any>;
    setBagState: (playerTgId: string, state: unknown) => Promise<void>;
    clearBagState: (playerTgId: string) => Promise<void>;
    getInspectState: (playerTgId: string) => Promise<any>;
    setInspectState: (playerTgId: string, state: unknown) => Promise<void>;
    clearInspectState: (playerTgId: string) => Promise<void>;
};
export {};
