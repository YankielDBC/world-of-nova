export declare function pickClimateKind(previous: any, biomeHint: any): any;
export declare function pickIntensity(kind: any): any;
export declare function pickSpecialEvent(biomeHint: any, kind: any, intensity: any): "flood" | "wildfire" | "quakes" | "duststorm" | "toxic_fog";
export declare function getClimateEffectsForBiome(biomeName: any, snapshot: any): {
    spawnMultiplier: number;
    yieldMultiplier: number;
    energyCostMultiplier: number;
};
