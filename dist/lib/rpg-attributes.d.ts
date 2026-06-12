export declare const CLASS_BONUS_TABLE: {
    curse_hunter: {
        str: number;
        dex: number;
        int: number;
        vit: number;
        agi: number;
        eng: number;
    };
    alchemist_rogue: {
        str: number;
        dex: number;
        int: number;
        vit: number;
        agi: number;
        eng: number;
    };
    dark_druid: {
        str: number;
        dex: number;
        int: number;
        vit: number;
        agi: number;
        eng: number;
    };
    arcane: {
        str: number;
        dex: number;
        int: number;
        vit: number;
        agi: number;
        eng: number;
    };
};
export declare function getClassAttributesAtLevel(params: any): {
    str: any;
    dex: any;
    int: any;
    vit: any;
    agi: any;
    eng: any;
};
export declare function getClassGrowthDebug(params: any): {
    lines: string[];
    attrs: {
        str: any;
        dex: any;
        int: any;
        vit: any;
        agi: any;
        eng: any;
    };
};
