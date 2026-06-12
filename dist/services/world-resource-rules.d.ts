export declare function getZoneResourcePolicyAtCoords(x: any, y: any): {
    zoneId: string;
    recommendedMin: number;
    recommendedMax: number;
    preferredMin: number;
    preferredMax: number;
    hardMax: number;
};
export declare function isNodeLevelAllowedInZone(requiredLevel: any, policy: any): boolean;
export declare function getZoneSpawnMultiplierForNode(requiredLevel: any, policy: any): number;
