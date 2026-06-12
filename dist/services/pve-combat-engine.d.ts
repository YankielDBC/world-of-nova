export declare function buildEncounterLog(existing: any, additions: any): any[];
export declare function getPvePressurePct(turnNumber: any): number;
export declare function tickPlayerEffects(effects: any): any;
export declare function tickEnemyEffects(effects: any): any;
export declare function tickCooldowns(cooldowns: any): {};
export declare function buildReactionConditionOk(event: any, def: any, hpPct: any, staPct: any): boolean;
export declare function getBuildReactionDefs(state: any): any[];
export declare function getBuildActiveDefs(state: any): any[];
export declare function getRacialActiveDefs(state: any): any[];
export declare function getBuildSkillStaminaCost(def: any): number;
export declare function rollChance(pct: any): boolean;
export declare function buildAttackDamage(attacker: any, target: any, options: any): {
    damage: any;
    crit: boolean;
    evaded: boolean;
    blockedCrit: boolean;
};
export declare function formatDamageOutcome(params: any): any;
export declare function triggerLocalReactions(params: any): Promise<{
    log: any[];
    playerEffects: any;
    cooldowns: any;
    counterAttackRatio: number;
} | {
    log: any[];
    playerEffects: any[];
    cooldowns: any;
    counterAttackRatio: number;
}>;
export declare function updateEncounterCreature(state: any, nextHp: any): any;
export declare function buildCurrentPlayerStats(view: any, extraEffects: any): any;
export declare function buildCurrentEnemyStats(view: any, extraEffects: any): {
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
};
