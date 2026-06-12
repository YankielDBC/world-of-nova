import type { CreatureSnapshot } from '../../services/creatures.js';
export declare function createPveModule(): {
    openScout: (ctx: any, snapshot: CreatureSnapshot, mode: "reply" | "edit") => Promise<void>;
    openByCommand: (ctx: any) => Promise<void>;
    openCombatForPlayer: (ctx: any, playerId: number, mode: "reply" | "edit", infoLine?: string) => Promise<void>;
    handleCallback: (ctx: any, callbackData: string) => Promise<boolean>;
    renderBlockedPrompt: (ctx: any) => Promise<boolean>;
};
