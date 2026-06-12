export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface GatherResult {
    item: string;
    emoji: string;
    quantity: number;
    rarity: Rarity;
}
export interface BiomeTree {
    id: string;
    name: string;
    emoji: string;
    dropTable: DropEntry[];
}
export interface DropEntry {
    item: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity?: Rarity;
}
export declare const BIOMES: Record<string, BiomeTree>;
interface EncounterType {
    emoji: string;
    name: string;
    biomeId: string;
    chance: number;
}
export declare const BIOME_ENCOUNTERS: Record<string, EncounterType[]>;
export {};
