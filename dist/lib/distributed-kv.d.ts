export declare function kvGet(namespace: string, key: string): Promise<string | null>;
export declare function kvSet(namespace: string, key: string, value: string, ttlSeconds?: number): Promise<void>;
export declare function kvDel(namespace: string, key: string): Promise<void>;
export declare function kvGetJson<T>(namespace: string, key: string): Promise<T | null>;
export declare function kvSetJson<T>(namespace: string, key: string, value: T, ttlSeconds?: number): Promise<void>;
