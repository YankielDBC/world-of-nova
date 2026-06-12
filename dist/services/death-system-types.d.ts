export type CorpseSnapshotEntry = {
    kind: 'resource';
    slotIndex: number;
    resourceId: number;
    resourceName: string;
    emoji: string;
    quantity: number;
} | {
    kind: 'tool';
    slotIndex: number;
    playerToolId: number;
    toolKey: string;
    toolName: string;
    emoji: string;
} | {
    kind: 'storedBag';
    slotIndex: number;
    storedBagId: number;
    bagName: string;
    emoji: string;
};
export type DeathStateRow = {
    playerId: number | bigint;
    tgId: string;
    corpseId: number | bigint;
    worldMapId: number | bigint;
    deathX: number | bigint;
    deathY: number | bigint;
    cemeteryX: number | bigint;
    cemeteryY: number | bigint;
    anchorWorldMapId: number | bigint | null;
    anchorX: number | bigint | null;
    anchorY: number | bigint | null;
    anchorLabel: string | null;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};
export type CorpseRow = {
    id: number | bigint;
    playerId: number | bigint;
    tgId: string;
    worldMapId: number | bigint;
    mapX: number | bigint;
    mapY: number | bigint;
    snapshotJson: string;
    silverDropped: number | bigint;
    silverRemaining: number | bigint;
    graceUntil: Date | string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    recoveredAt: Date | string | null;
};
export interface ActiveDeathState {
    playerId: number;
    tgId: string;
    corpseId: number;
    worldMapId: number;
    deathX: number;
    deathY: number;
    cemeteryX: number;
    cemeteryY: number;
    anchorWorldMapId: number | null;
    anchorX: number | null;
    anchorY: number | null;
    anchorLabel: string;
    status: 'GHOST';
    createdAt: number;
    updatedAt: number;
}
export interface PlayerCorpseState {
    id: number;
    playerId: number;
    tgId: string;
    worldMapId: number;
    mapX: number;
    mapY: number;
    snapshot: CorpseSnapshotEntry[];
    silverDropped: number;
    silverRemaining: number;
    graceUntil: number;
    status: string;
    createdAt: number;
    updatedAt: number;
    recoveredAt: number | null;
}
export interface DeathTransitionResult {
    death: ActiveDeathState;
    corpse: PlayerCorpseState;
    droppedStacks: number;
    droppedSilver: number;
}
