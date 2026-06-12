import { getZoneBandAtCoords } from './world-zones.js';
export function getZoneResourcePolicyAtCoords(x, y) {
    const zone = getZoneBandAtCoords(x, y);
    const preferredMin = Math.max(1, zone.recommendedLevelMin - 1);
    const preferredMax = zone.recommendedLevelMax;
    const hardMax = zone.recommendedLevelMax + 4;
    return {
        zoneId: zone.id,
        recommendedMin: zone.recommendedLevelMin,
        recommendedMax: zone.recommendedLevelMax,
        preferredMin,
        preferredMax,
        hardMax,
    };
}
export function isNodeLevelAllowedInZone(requiredLevel, policy) {
    return requiredLevel <= policy.hardMax;
}
export function getZoneSpawnMultiplierForNode(requiredLevel, policy) {
    if (requiredLevel > policy.hardMax) {
        return 0;
    }
    if (requiredLevel > policy.preferredMax) {
        const excess = requiredLevel - policy.preferredMax;
        return Math.max(0.08, 1 - excess * 0.24);
    }
    if (requiredLevel < policy.preferredMin) {
        const deficit = policy.preferredMin - requiredLevel;
        return Math.max(0.32, 1 - deficit * 0.12);
    }
    return 1;
}
