export declare function kvGet(namespace: any, key: any): Promise<any>;
export declare function kvSet(namespace: any, key: any, value: any, ttlSeconds: any): Promise<void>;
export declare function kvDel(namespace: any, key: any): Promise<void>;
export declare function kvGetJson(namespace: any, key: any): Promise<any>;
export declare function kvSetJson(namespace: any, key: any, value: any, ttlSeconds: any): Promise<void>;
