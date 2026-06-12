import type { InlineKeyboard } from 'grammy';
import type { prisma } from '../lib/db.js';
import type { GroundLootEntry } from '../lib/tile-state.js';
import type { SkillKey } from './progression.js';
export type NodeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type InspectNodeKind = 'node' | 'ground';
export type InspectActionType = 'chop' | 'mine' | 'gather';
export type GameplayActionKey = 'chop' | 'mine' | 'gather' | 'fish';
export type ResourceNodeTemplate = Awaited<ReturnType<typeof prisma.resourceNode.findMany>>[number];
export interface ParsedYield {
    resource: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity: NodeRarity;
}
export interface InspectNodeView {
    listIndex: number;
    kind: InspectNodeKind;
    nodeId?: number;
    groundLootId?: string;
    nodeType: string;
    emoji: string;
    displayName: string;
    available: number;
    requiredLevel: number;
    requiredSkill: SkillKey;
    action: InspectActionType;
    rarity: NodeRarity;
    rarityCode: string;
}
export interface InspectRenderResult {
    isPlace: boolean;
    text: string;
    keyboard?: InlineKeyboard;
    tileId?: number;
    nodes: InspectNodeView[];
}
export interface InspectActionResult {
    success: boolean;
    message: string;
    tileId?: number;
    toolBroken?: boolean;
}
export interface GroundPickupParams {
    tileId: number;
    playerId: number;
    selected: InspectNodeView;
    quantity: number;
}
export type GroundNodeEntry = GroundLootEntry;
