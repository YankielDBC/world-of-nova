export declare function overlaps(aOffset: any, aLength: any, bOffset: any, bLength: any): boolean;
export declare function fnv1aHash(input: any): number;
export declare function buildLineStartOffsets(lines: any): any[];
export declare function escapeHtml(text: any): any;
export declare function getEntityFieldsForMethod(method: any): {
    textField: string;
    entitiesField: string;
};
export declare function isEntityTextInvalidError(error: any): boolean;
export declare function collectCustomEmojiIdsFromEntities(entities: any): unknown[];
export declare function collectCustomEmojiIdCountsFromEntities(entities: any): {};
export declare function stripCustomEmojiIdFromEntities(entities: any, customEmojiId: any): any;
export declare function stripAllCustomEmojiEntities(entities: any): any;
export declare function sortCustomEmojiIdsForRetry(ids: any, counts: any): any[];
