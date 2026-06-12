export declare function getSkillKeyForAction(action: any): "gather" | "chop" | "mine";
export declare function getRequiredSkillXp(skillKey: any, level: any): number;
export declare function getSkillColorBand(skillLevel: any, requiredLevel: any): "red" | "orange" | "yellow" | "green" | "gray";
export declare function getSkillXpGain(params: any): {
    gainedXp: number;
    band: string;
};
export declare function ensurePlayerProgression(playerId: any, grantStarterSkills?: boolean, tx?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<void>;
export declare function getPlayerSkill(playerId: any, skillKey: any): Promise<{
    level: number;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    playerId: number;
    skillKey: string;
    xp: number;
    learned: boolean;
}>;
export declare function awardSkillXp(playerId: any, skillKey: any, xpAmount: any): Promise<{
    beforeLevel: number;
    afterLevel: number;
    gainedLevels: number;
    gainedXp: number;
    currentXp: number;
    requiredXp: number;
}>;
export declare function getSkillsCard(playerId: any, lang?: string): Promise<string>;
