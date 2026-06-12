import type { Bot } from 'grammy';
export type AnyCtx = any;
export interface CoreCommandDeps {
    registrationModule: {
        handleStartCommand: (ctx: AnyCtx) => Promise<void>;
    };
    placeModule: {
        handlePlaceEntry: (ctx: AnyCtx) => Promise<void>;
    };
    mysteryMerchantModule: {
        openByCommand: (ctx: AnyCtx) => Promise<void>;
    };
    pveModule: {
        openByCommand: (ctx: AnyCtx) => Promise<void>;
    };
    buildModule: {
        openByCommand: (ctx: AnyCtx) => Promise<void>;
    };
    racialModule: {
        openByCommand: (ctx: AnyCtx) => Promise<void>;
    };
    handleProfile: (ctx: AnyCtx) => Promise<void>;
    handleTitle: (ctx: AnyCtx) => Promise<void>;
    handleUnequipBag: (ctx: AnyCtx) => Promise<void>;
    handleDevMode: (ctx: AnyCtx) => Promise<void>;
    renderInspectResponse: (ctx: AnyCtx, mode: 'reply' | 'edit') => Promise<void>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    ensurePlayerProgression: (playerId: number, grantStarterSkills?: boolean) => Promise<void>;
    getEquipmentCard: (playerId: number) => Promise<string>;
    getSkillsCard: (playerId: number, lang?: any) => Promise<string>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => any;
    grantToolToPlayer: (playerId: number, toolKey: string) => Promise<{
        message: string;
    }>;
    listBiomes: () => Promise<Array<{
        emoji: string;
        name: string;
    }>>;
    t: (lang: any, key: any) => string;
    renderMap: (tgId: string) => Promise<any>;
    renderMapCardText: (mapResult: any, lang: any) => string;
    renderCoordinateInteractions: (ctx: AnyCtx, mode: 'reply' | 'edit') => Promise<void>;
    requestSosDelivery: (playerId: number, lang: any) => Promise<{
        message: string;
    }>;
    hasActivePlaceRecovery: (tgId: string) => Promise<boolean>;
    finalizeActiveRecovery: (params: {
        tgId: string;
        interrupted: boolean;
    }) => Promise<any>;
    t3: (lang: any, es: string, en: string, ru: string) => string;
    startVentureFlow: (ctx: AnyCtx) => Promise<void>;
    renderBagResponse: (ctx: AnyCtx) => Promise<void>;
    getToolsCard: (playerId: number) => Promise<string>;
}
export type CoreCommandRegistrar = (bot: Bot, deps: CoreCommandDeps) => void;
