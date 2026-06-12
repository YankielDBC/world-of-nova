export declare function getNearestCemeteryCoords(x: any, y: any): {
    x: number;
    y: number;
    label: string;
    distance: number;
};
export declare function isNearCemetery(x: any, y: any, radius?: number): boolean;
export declare function killPlayerAndCreateCorpse(params: any): Promise<any>;
export declare function recoverOwnCorpse(tgId: any): Promise<any>;
