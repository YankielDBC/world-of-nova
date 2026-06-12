import { prisma } from '../lib/db.js';
import { getZoneBandAtCoords, getRadialDistance } from './world-zones.js';
const DYNAMIC_TYPE = 'DYNAMIC';
const VILLAGE_PREFIX = 'frontier-village-';
const CAVE_PREFIX = 'ancient-cave-';
const RUIN_PREFIX = 'ancient-ruins-';
const DYNAMIC_PREFIXES = [VILLAGE_PREFIX, CAVE_PREFIX, RUIN_PREFIX];
function seededRandom(x, y, salt) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + salt * 437.314) * 43758.5453;
    return n - Math.floor(n);
}
function pickSeededPart(parts, x, y, salt) {
    const index = Math.floor(seededRandom(x, y, salt) * parts.length);
    return parts[index] || parts[0];
}
function buildVillageDisplayName(x, y) {
    const prefixes = ['Alder', 'Raven', 'Moss', 'Ash', 'Silk', 'Thorn', 'Moon', 'Sun'];
    const suffixes = ['Hollow', 'Haven', 'Cross', 'Watch', 'Vale', 'Hamlet', 'Rest', 'Hold'];
    return `${pickSeededPart(prefixes, x, y, 11)} ${pickSeededPart(suffixes, x, y, 17)}`;
}
function buildCaveDisplayName(x, y) {
    const prefixes = ['Echo', 'Black', 'Whisper', 'Ash', 'Stone', 'Night', 'Deep', 'Cinder'];
    const suffixes = ['Mouth', 'Hollow', 'Vein', 'Crack', 'Rift', 'Den', 'Depths', 'Grotto'];
    return `${pickSeededPart(prefixes, x, y, 23)} ${pickSeededPart(suffixes, x, y, 31)}`;
}
function buildRuinDisplayName(x, y) {
    const prefixes = ['Forgotten', 'Ancient', 'Silent', 'Dust', 'Moon', 'Riven', 'Broken', 'Last'];
    const suffixes = ['Courtyard', 'Archive', 'Gate', 'Sanctum', 'Pillar', 'Hall', 'Crypt', 'Ruins'];
    return `${pickSeededPart(prefixes, x, y, 41)} ${pickSeededPart(suffixes, x, y, 53)}`;
}
function getCandidateKind(x, y) {
    const distance = getRadialDistance(x, y);
    const zoneBand = getZoneBandAtCoords(x, y);
    if (distance < 10) {
        return null;
    }
    const villageRoll = seededRandom(x, y, 101);
    const caveRoll = seededRandom(x, y, 202);
    const ruinRoll = seededRandom(x, y, 303);
    const villagePass = villageRoll < zoneBand.villageSpawnChance;
    const cavePass = caveRoll < zoneBand.caveSpawnChance;
    const ruinPass = ruinRoll < zoneBand.ruinSpawnChance;
    if (!villagePass && !cavePass && !ruinPass) {
        return null;
    }
    const candidates = [];
    if (villagePass) {
        candidates.push({
            kind: 'village',
            score: villageRoll / Math.max(zoneBand.villageSpawnChance, 0.0001),
        });
    }
    if (cavePass) {
        candidates.push({
            kind: 'cave',
            score: caveRoll / Math.max(zoneBand.caveSpawnChance, 0.0001),
        });
    }
    if (ruinPass) {
        candidates.push({
            kind: 'ruin',
            score: ruinRoll / Math.max(zoneBand.ruinSpawnChance, 0.0001),
        });
    }
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0]?.kind || null;
}
function getKindPrefix(kind) {
    if (kind === 'village') {
        return VILLAGE_PREFIX;
    }
    if (kind === 'cave') {
        return CAVE_PREFIX;
    }
    return RUIN_PREFIX;
}
function getKindExclusionRadius(kind, x, y) {
    const band = getZoneBandAtCoords(x, y);
    if (kind === 'village') {
        return band.villageExclusionRadius;
    }
    if (kind === 'cave') {
        return band.caveExclusionRadius;
    }
    return band.ruinExclusionRadius;
}
function getPlaceKindFromSlug(slug) {
    const value = String(slug || '');
    if (value.startsWith(VILLAGE_PREFIX)) {
        return 'village';
    }
    if (value.startsWith(CAVE_PREFIX)) {
        return 'cave';
    }
    if (value.startsWith(RUIN_PREFIX)) {
        return 'ruin';
    }
    return null;
}
function getCrossKindRadius(baseRadius, candidateKind, existingKind) {
    if (candidateKind === existingKind) {
        return baseRadius;
    }
    // Allow mixed clusters (village+cave/ruin) to feel more alive.
    if (candidateKind === 'village' && existingKind === 'cave')
        return Math.max(6, Math.round(baseRadius * 0.55));
    if (candidateKind === 'village' && existingKind === 'ruin')
        return Math.max(7, Math.round(baseRadius * 0.6));
    if (candidateKind === 'cave' && existingKind === 'village')
        return Math.max(6, Math.round(baseRadius * 0.55));
    if (candidateKind === 'cave' && existingKind === 'ruin')
        return Math.max(8, Math.round(baseRadius * 0.8));
    if (candidateKind === 'ruin' && existingKind === 'village')
        return Math.max(7, Math.round(baseRadius * 0.6));
    if (candidateKind === 'ruin' && existingKind === 'cave')
        return Math.max(8, Math.round(baseRadius * 0.8));
    return Math.max(6, Math.round(baseRadius * 0.65));
}
async function hasNearbyDynamicPlace(params) {
    const minX = params.x - params.exclusionRadius;
    const maxX = params.x + params.exclusionRadius;
    const minY = params.y - params.exclusionRadius;
    const maxY = params.y + params.exclusionRadius;
    const nearby = await prisma.place.findMany({
        where: {
            type: DYNAMIC_TYPE,
            isActive: true,
            OR: DYNAMIC_PREFIXES.map((prefix) => ({ slug: { startsWith: prefix } })),
            coordX: { gte: minX, lte: maxX, not: null },
            coordY: { gte: minY, lte: maxY, not: null },
        },
        select: {
            slug: true,
            coordX: true,
            coordY: true,
        },
        take: 120,
    });
    for (const place of nearby) {
        if (place.coordX == null || place.coordY == null) {
            continue;
        }
        const existingKind = getPlaceKindFromSlug(place.slug);
        if (!existingKind) {
            continue;
        }
        const localRadius = getCrossKindRadius(params.exclusionRadius, params.kind, existingKind);
        const radiusSquared = localRadius * localRadius;
        const dx = place.coordX - params.x;
        const dy = place.coordY - params.y;
        if (dx * dx + dy * dy <= radiusSquared) {
            return true;
        }
    }
    return false;
}
async function createDynamicVillage(x, y) {
    const slug = `${VILLAGE_PREFIX}${x}-${y}`;
    const displayName = buildVillageDisplayName(x, y);
    try {
        return await prisma.place.create({
            data: {
                slug,
                name: displayName,
                displayName,
                description: 'Pequeno asentamiento de frontera con servicios basicos para viajeros.',
                type: DYNAMIC_TYPE,
                coordX: x,
                coordY: y,
                emoji: '🏘️',
                pvpAllowed: false,
                combatAllowed: false,
                isActive: true,
                interactions: {
                    create: [
                        {
                            slug: 'village-rest',
                            name: 'Village Rest',
                            displayName: 'Village Rest',
                            description: 'Recupera stamina con descanso basico.',
                            type: 'SERVICE',
                            emoji: '💤',
                            costType: 'SILVER',
                            costAmount: 5,
                            effectType: 'ENERGY',
                            effectValue: 0,
                            instantFull: true,
                            sortOrder: 1,
                        },
                        {
                            slug: 'village-rest-quick',
                            name: 'Village Swift Rest',
                            displayName: 'Swift Rest',
                            description: 'Descanso rapido con recuperacion acelerada.',
                            type: 'SERVICE',
                            emoji: '⚡',
                            costType: 'SILVER',
                            costAmount: 10,
                            effectType: 'ENERGY',
                            effectValue: 0,
                            instantFull: true,
                            sortOrder: 2,
                        },
                        {
                            slug: 'village-shrine',
                            name: 'Village Shrine Mercy',
                            displayName: 'Mercy',
                            description: 'Curacion basica en el santuario del pueblo.',
                            type: 'SERVICE',
                            emoji: '✨',
                            costType: 'SILVER',
                            costAmount: 5,
                            effectType: 'HP',
                            effectValue: 0,
                            instantFull: true,
                            sortOrder: 3,
                        },
                        {
                            slug: 'village-shrine-divine',
                            name: 'Village Shrine Divine',
                            displayName: 'Divine',
                            description: 'Curacion premium del santuario.',
                            type: 'SERVICE',
                            emoji: '✨',
                            costType: 'SILVER',
                            costAmount: 10,
                            effectType: 'HP',
                            effectValue: 0,
                            instantFull: true,
                            sortOrder: 4,
                        },
                        {
                            slug: 'village-chest-open',
                            name: 'Village Chest',
                            displayName: 'Open Chest',
                            description: 'Gestiona tu baul pequeno de 10 slots.',
                            type: 'SERVICE',
                            emoji: '🧰',
                            costType: null,
                            costAmount: null,
                            effectType: null,
                            effectValue: null,
                            instantFull: false,
                            sortOrder: 5,
                        },
                    ],
                },
            },
            include: {
                interactions: { orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    catch {
        return prisma.place.findUnique({
            where: { slug },
            include: { interactions: { orderBy: { sortOrder: 'asc' } } },
        });
    }
}
async function createDynamicCave(x, y) {
    const slug = `${CAVE_PREFIX}${x}-${y}`;
    const displayName = buildCaveDisplayName(x, y);
    try {
        return await prisma.place.create({
            data: {
                slug,
                name: displayName,
                displayName,
                description: 'Entrada de cueva antigua. Puedes descender y explorar su interior.',
                type: DYNAMIC_TYPE,
                coordX: x,
                coordY: y,
                emoji: '🕳️',
                pvpAllowed: true,
                combatAllowed: true,
                isActive: true,
                interactions: {
                    create: [
                        {
                            slug: 'cave-expedition',
                            name: 'Cave Expedition',
                            displayName: 'Expedition',
                            description: 'Descend into the cave interior.',
                            type: 'SERVICE',
                            emoji: '🕳️',
                            costType: null,
                            costAmount: null,
                            effectType: null,
                            effectValue: null,
                            instantFull: false,
                            sortOrder: 1,
                        },
                    ],
                },
            },
            include: {
                interactions: { orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    catch {
        return prisma.place.findUnique({
            where: { slug },
            include: { interactions: { orderBy: { sortOrder: 'asc' } } },
        });
    }
}
async function createDynamicRuin(x, y) {
    const slug = `${RUIN_PREFIX}${x}-${y}`;
    const displayName = buildRuinDisplayName(x, y);
    try {
        return await prisma.place.create({
            data: {
                slug,
                name: displayName,
                displayName,
                description: 'Ruinas antiguas cubiertas de polvo. La exploracion profunda llegara pronto.',
                type: DYNAMIC_TYPE,
                coordX: x,
                coordY: y,
                emoji: '🏚️',
                pvpAllowed: true,
                combatAllowed: true,
                isActive: true,
            },
            include: {
                interactions: { orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    catch {
        return prisma.place.findUnique({
            where: { slug },
            include: { interactions: { orderBy: { sortOrder: 'asc' } } },
        });
    }
}
async function ensureDynamicPlaceInteractions(place) {
    if (!place.slug.startsWith(CAVE_PREFIX)) {
        return;
    }
    const desiredDescription = 'Entrada de cueva antigua. Puedes descender y explorar su interior.';
    const desiredEmoji = '🕳️';
    if (place.description !== desiredDescription || place.emoji !== desiredEmoji) {
        try {
            await prisma.place.update({
                where: { id: place.id },
                data: {
                    description: desiredDescription,
                    emoji: desiredEmoji,
                },
            });
        }
        catch {
            // Ignore metadata refresh races.
        }
    }
    const hasExpedition = (place.interactions || []).some((interaction) => interaction.slug === 'cave-expedition');
    if (hasExpedition) {
        return;
    }
    try {
        await prisma.placeInteraction.create({
            data: {
                placeId: place.id,
                slug: 'cave-expedition',
                name: 'Cave Expedition',
                displayName: 'Expedition',
                description: 'Descend into the cave interior.',
                type: 'SERVICE',
                emoji: '🕳️',
                costType: null,
                costAmount: null,
                effectType: null,
                effectValue: null,
                instantFull: false,
                sortOrder: 1,
            },
        });
    }
    catch {
        // Concurrent refreshes can race here.
    }
}
export async function ensureDynamicPlaceAtCoords(params) {
    const { x, y, worldMapId } = params;
    if (!Number.isFinite(worldMapId) || worldMapId < 1) {
        return null;
    }
    if (x === 0 && y === 0) {
        return null;
    }
    const existing = await prisma.place.findFirst({
        where: {
            type: DYNAMIC_TYPE,
            isActive: true,
            coordX: x,
            coordY: y,
        },
        include: {
            interactions: { orderBy: { sortOrder: 'asc' } },
        },
    });
    if (existing) {
        await ensureDynamicPlaceInteractions(existing);
        if (existing.slug.startsWith(CAVE_PREFIX)) {
            return prisma.place.findUnique({
                where: { id: existing.id },
                include: {
                    interactions: { orderBy: { sortOrder: 'asc' } },
                },
            });
        }
        return existing;
    }
    const kind = getCandidateKind(x, y);
    if (!kind) {
        return null;
    }
    const exclusionRadius = getKindExclusionRadius(kind, x, y);
    const blockedByNearby = await hasNearbyDynamicPlace({
        x,
        y,
        kind,
        exclusionRadius,
    });
    if (blockedByNearby) {
        return null;
    }
    if (kind === 'village') {
        return createDynamicVillage(x, y);
    }
    if (kind === 'cave') {
        return createDynamicCave(x, y);
    }
    return createDynamicRuin(x, y);
}
