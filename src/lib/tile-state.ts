// @ts-nocheck
const EMPTY_STATE = {
    version: 1,
    nodes: [],
    groundLoot: [],
    generatedPeriodKey: null,
};
const RECOVERY_SECONDS_BY_RARITY = {
    common: 70,
    uncommon: 120,
    rare: 185,
    epic: 260,
    legendary: 360,
};
function safeInt(value, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return fallback;
    }
    return Math.max(0, Math.floor(number));
}
function safeNullableTimestamp(value) {
    if (value == null) {
        return null;
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
        return null;
    }
    return Math.floor(number);
}
function normalizeNode(node) {
    const nodeId = safeInt(node.nodeId, -1);
    if (nodeId < 0) {
        return null;
    }
    const available = safeInt(node.available, 0);
    const baseAvailable = Math.max(available, safeInt(node.baseAvailable, available || 1));
    return {
        nodeId,
        nodeType: String(node.nodeType || ''),
        emoji: String(node.emoji || ''),
        displayName: String(node.displayName || ''),
        available,
        requiredTool: node.requiredTool ? String(node.requiredTool) : null,
        requiredLevel: safeInt(node.requiredLevel, 1),
        rarity: String(node.rarity || 'common').toLowerCase() || 'common',
        baseAvailable,
        pendingRestore: safeInt(node.pendingRestore, 0),
        cooldownUntilMs: safeNullableTimestamp(node.cooldownUntilMs),
        lastHarvestedAtMs: safeNullableTimestamp(node.lastHarvestedAtMs),
    };
}
function normalizeGroundLoot(entry) {
    const id = String(entry.id || '').trim();
    const quantity = safeInt(entry.quantity, 0);
    if (!id || quantity < 1) {
        return null;
    }
    const kind = String(entry.kind || 'resource').toLowerCase() || 'resource';
    return {
        id,
        kind,
        emoji: String(entry.emoji || ''),
        name: String(entry.name || ''),
        quantity,
        resourceName: entry.resourceName ? String(entry.resourceName) : undefined,
        resourceId: entry.resourceId == null ? undefined : safeInt(entry.resourceId),
        toolKey: entry.toolKey ? String(entry.toolKey) : undefined,
        playerToolId: entry.playerToolId == null ? undefined : safeInt(entry.playerToolId),
        equipmentInstanceId: entry.equipmentInstanceId == null ? undefined : safeInt(entry.equipmentInstanceId),
        templateKey: entry.templateKey ? String(entry.templateKey) : undefined,
        bagSlug: entry.bagSlug ? String(entry.bagSlug) : undefined,
        droppedByPlayerId: entry.droppedByPlayerId == null ? undefined : safeInt(entry.droppedByPlayerId),
        droppedAtMs: safeInt(entry.droppedAtMs, Date.now()),
    };
}
function normalizeArrayNodes(raw) {
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw
        .map((node) => normalizeNode(node))
        .filter((node) => !!node);
}
function normalizeArrayLoot(raw) {
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw
        .map((entry) => normalizeGroundLoot(entry))
        .filter((entry) => !!entry);
}
export function readTileResourceState(rawJson) {
    if (!rawJson) {
        return { ...EMPTY_STATE };
    }
    try {
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed)) {
            return {
                version: 1,
                nodes: normalizeArrayNodes(parsed),
                groundLoot: [],
                generatedPeriodKey: null,
            };
        }
        if (parsed && typeof parsed === 'object') {
            return {
                version: 1,
                nodes: normalizeArrayNodes(parsed.nodes),
                groundLoot: normalizeArrayLoot(parsed.groundLoot),
                generatedPeriodKey: typeof parsed.generatedPeriodKey === 'string'
                    ? String(parsed.generatedPeriodKey)
                    : null,
            };
        }
    }
    catch {
        // Ignore malformed JSON and fallback to empty state.
    }
    return { ...EMPTY_STATE };
}
export function serializeTileResourceState(state) {
    return JSON.stringify({
        version: 1,
        nodes: state.nodes,
        groundLoot: state.groundLoot,
        generatedPeriodKey: state.generatedPeriodKey,
    });
}
export function applyNodeCooldownRecovery(nodes, nowMs = Date.now()) {
    let changed = false;
    const recovered = nodes.map((node) => {
        if (!node.pendingRestore || !node.cooldownUntilMs || nowMs < node.cooldownUntilMs) {
            return node;
        }
        changed = true;
        return {
            ...node,
            available: Math.min(node.baseAvailable, node.available + node.pendingRestore),
            pendingRestore: 0,
            cooldownUntilMs: null,
        };
    });
    return { nodes: recovered, changed };
}
function getRecoveryMs(rarity, harvestedRatio) {
    const baseSeconds = RECOVERY_SECONDS_BY_RARITY[rarity] ?? RECOVERY_SECONDS_BY_RARITY.common;
    const clampedRatio = Math.min(1, Math.max(0.1, harvestedRatio));
    const ratioMultiplier = 0.75 + clampedRatio * 1.8;
    const jitterMultiplier = 0.85 + Math.random() * 0.4;
    return Math.round(baseSeconds * ratioMultiplier * jitterMultiplier * 1000);
}
export function applyHarvestCooldown(node, quantityUsed, nowMs = Date.now()) {
    const harvested = Math.min(Math.max(0, quantityUsed), node.available);
    if (harvested <= 0) {
        return {
            updatedNode: node,
            recoveredInMs: 0,
        };
    }
    const harvestedRatio = harvested / Math.max(1, node.baseAvailable);
    const recoveredInMs = getRecoveryMs(node.rarity, harvestedRatio);
    return {
        updatedNode: {
            ...node,
            available: Math.max(0, node.available - harvested),
            pendingRestore: node.pendingRestore + harvested,
            cooldownUntilMs: nowMs + recoveredInMs,
            lastHarvestedAtMs: nowMs,
        },
        recoveredInMs,
    };
}
function buildResourceMergeKey(entry) {
    if (entry.kind === 'resource') {
        return `resource:${entry.resourceId || 0}:${entry.resourceName || entry.name}`;
    }
    if (entry.kind === 'equipment') {
        return `equipment:${entry.equipmentInstanceId || entry.templateKey || entry.id}`;
    }
    if (entry.kind === 'bag') {
        return `bag:${entry.bagSlug || entry.name}`;
    }
    return `tool:${entry.playerToolId || entry.toolKey || entry.id}`;
}
export function addGroundLootEntry(state, entry) {
    const now = Date.now();
    const candidate = {
        ...entry,
        id: `loot_${now.toString(36)}_${Math.floor(Math.random() * 999999).toString(36)}`,
        droppedAtMs: now,
    };
    const mergeKey = buildResourceMergeKey(candidate);
    const nextGroundLoot = [...state.groundLoot];
    const existingIndex = nextGroundLoot.findIndex((item) => buildResourceMergeKey(item) === mergeKey);
    if (existingIndex >= 0 && candidate.kind !== 'tool' && candidate.kind !== 'equipment') {
        const existing = nextGroundLoot[existingIndex];
        nextGroundLoot[existingIndex] = {
            ...existing,
            quantity: existing.quantity + candidate.quantity,
            droppedAtMs: now,
        };
    }
    else {
        nextGroundLoot.push(candidate);
    }
    return {
        state: {
            ...state,
            groundLoot: nextGroundLoot,
        },
        created: candidate,
    };
}
export function takeGroundLootQuantity(state, lootId, quantity) {
    const index = state.groundLoot.findIndex((entry) => entry.id === lootId);
    if (index < 0) {
        return { state, taken: null };
    }
    const current = state.groundLoot[index];
    const requested = Math.max(1, Math.floor(quantity));
    const takenQty = Math.min(current.quantity, requested);
    if (takenQty <= 0) {
        return { state, taken: null };
    }
    const taken = {
        ...current,
        quantity: takenQty,
    };
    const nextGroundLoot = [...state.groundLoot];
    if (current.quantity === takenQty) {
        nextGroundLoot.splice(index, 1);
    }
    else {
        nextGroundLoot[index] = {
            ...current,
            quantity: current.quantity - takenQty,
        };
    }
    return {
        state: {
            ...state,
            groundLoot: nextGroundLoot,
        },
        taken,
    };
}
