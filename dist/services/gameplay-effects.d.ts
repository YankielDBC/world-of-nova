import type { BuildConditionSnapshot } from './build-skills.js';
import { type RacialGameplayEffects } from './racial-effects.js';
export interface GameplayEffects extends RacialGameplayEffects {
    counterAttackRatio: number;
}
export declare function getGameplayEffectsForPlayer(playerId: number, condition?: BuildConditionSnapshot): Promise<GameplayEffects>;
export declare function invalidateGameplayEffectsCache(playerId?: number): void;
