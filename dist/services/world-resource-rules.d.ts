export interface ZoneResourcePolicy {
    zoneId: string;
    recommendedMin: number;
    recommendedMax: number;
    preferredMin: number;
    preferredMax: number;
    hardMax: number;
}
export declare function getZoneResourcePolicyAtCoords(x: number, y: number): ZoneResourcePolicy;
export declare function isNodeLevelAllowedInZone(requiredLevel: number, policy: ZoneResourcePolicy): boolean;
export declare function getZoneSpawnMultiplierForNode(requiredLevel: number, policy: ZoneResourcePolicy): number;
