export declare function getConversationState<T>(scope: string, playerTgId: number | string): Promise<T | null>;
export declare function setConversationState<T>(scope: string, playerTgId: number | string, value: T, ttlSeconds?: number): Promise<void>;
export declare function clearConversationState(scope: string, playerTgId: number | string): Promise<void>;
