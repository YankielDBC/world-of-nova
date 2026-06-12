import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
export type DbClient = typeof prisma | Prisma.TransactionClient;
export type CreatureCategory = 'basic' | 'veteran' | 'elite' | 'boss';
export type CreatureStatus = 'ALIVE' | 'DEAD';
export interface CreatureDrop {
    resourceId: number;
    emoji: string;
    name: string;
    minQty: number;
    maxQty: number;
    chancePct: number;
}
export interface CreatureAttributes {
    str: number;
    dex: number;
    intelligence: number;
    vit: number;
    agi: number;
    eng: number;
}
export interface CreatureSnapshot {
    id: number;
    worldMapId: number;
    x: number;
    y: number;
    spawnSlot: number;
    biomeName: string;
    displayName: string;
    category: CreatureCategory;
    level: number;
    attributes: CreatureAttributes;
    maxHp: number;
    currentHp: number;
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
    xpReward: number;
    silverMin: number;
    silverMax: number;
    coinDropChance: number;
    respawnSeconds: number;
    drops: CreatureDrop[];
    status: CreatureStatus;
    nextRespawnAt: Date | null;
}
export interface CreatureRow {
    id: number | bigint;
    worldMapId: number | bigint;
    tileX: number | bigint;
    tileY: number | bigint;
    spawnSlot: number | bigint;
    biomeName: string;
    displayName: string;
    category: string;
    level: number | bigint;
    str: number | bigint;
    dex: number | bigint;
    intelligence: number | bigint;
    vit: number | bigint;
    agi: number | bigint;
    eng: number | bigint;
    maxHp: number | bigint;
    currentHp: number | bigint;
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
    xpReward: number | bigint;
    silverMin: number | bigint;
    silverMax: number | bigint;
    coinDropChance: number;
    respawnSeconds: number | bigint;
    dropsJson: string;
    status: string;
    nextRespawnAt: Date | string | null;
}
export interface BiomeResourceRow {
    resourceId: number | bigint;
    spawnChance: number;
    name: string;
    emoji: string;
    maxStack: number | bigint;
}
export interface CategoryConfig {
    emoji: string;
    levelBonusMin: number;
    levelBonusMax: number;
    hpMultiplier: number;
    attackMultiplier: number;
    defenseMultiplier: number;
    xpMultiplier: number;
    coinChanceMin: number;
    coinChanceMax: number;
    respawnMinSeconds: number;
    respawnMaxSeconds: number;
    dropBonus: number;
}
export interface SpawnContext {
    worldMapId: number;
    x: number;
    y: number;
    biomeName: string;
    biomeId: number | null;
}
