// @ts-nocheck
import { prisma, calculateCombatStats } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { getCreatureSnapshotById, } from './creatures.js';
import { getLocalizedText3, } from '../data/skill-trees.js';
import { getPlayerBuildSkillState } from './build-skills.js';
import { getPlayerRacialTalentState, } from './racial-talents.js';
import { getGameplayEffectsForPlayer } from './gameplay-effects.js';
import { getPlayerEquipmentCombatModifiers } from './equipment.js';
import { aggregateEnemyEffects, aggregatePlayerEffects, mergeCombatModifiers, shortLabel, t3, } from './pve-combat-utils.js';
import { createInitialIntent, describeCreatureStyle, getRacialSkillSpec, mapEnemyStats, } from './pve-combat-content.js';
export { getCreatureScoutText } from './pve-combat-content.js';
import { deleteEncounter, ensurePveCombatSchema, getEncounterHolderByCreatureId, getPlayerFieldsForCombat, readEncounterByPlayerId, serializeState, } from './pve-combat-state.js';
import { getBuildActiveDefs, getBuildReactionDefs, getBuildSkillStaminaCost, getRacialActiveDefs, } from './pve-combat-engine.js';
export { getPvePressurePct } from './pve-combat-engine.js';
import { resolvePveAction } from './pve-combat-actions.js';
export { resolvePveAction };
export async function computeEncounterViewFromState(state, lang) {
    const [player, buildState, racialState] = await Promise.all([
        prisma.player.findUnique({
            where: { id: state.playerId },
            select: getPlayerFieldsForCombat(),
        }),
        getPlayerBuildSkillState(state.playerId),
        getPlayerRacialTalentState(state.playerId),
    ]);
    if (!player)
        return null;
    const condition = {
        hpPct: player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 100,
        staPct: player.maxEnergy > 0 ? (player.energy / player.maxEnergy) * 100 : 100,
    };
    const globalEffects = await getGameplayEffectsForPlayer(state.playerId, condition);
    const equipmentModifiers = await getPlayerEquipmentCombatModifiers(state.playerId);
    const localPlayerAggregate = aggregatePlayerEffects(state.playerEffects);
    const combinedPlayerMods = mergeCombatModifiers(mergeCombatModifiers(globalEffects.combatModifiers, equipmentModifiers), localPlayerAggregate.modifiers);
    const playerStats = calculateCombatStats(player, combinedPlayerMods);
    const enemyMods = aggregateEnemyEffects(state.enemyEffects);
    const enemyStats = mapEnemyStats(state.creature, enemyMods);
    const buildDefs = buildState ? getBuildActiveDefs(buildState) : [];
    const racialDefs = racialState ? getRacialActiveDefs(racialState) : [];
    const buildChoices = buildDefs.map((def, index) => ({
        key: def.key,
        label: getLocalizedText3(def.name, lang),
        shortSummary: shortLabel(getLocalizedText3(def.summary, lang), 24),
        cooldownTurns: Math.max(0, state.cooldowns[def.key] || 0),
        staminaCost: getBuildSkillStaminaCost(def),
        ready: !state.cooldowns[def.key],
        kind: 'build',
        slotLabel: `A${index + 1}`,
    }));
    const racialChoices = racialDefs.map((def, index) => {
        const spec = getRacialSkillSpec(player.race, def.key);
        return {
            key: def.key,
            label: getLocalizedText3(def.name, lang),
            shortSummary: shortLabel(getLocalizedText3(def.summary, lang), 24),
            cooldownTurns: Math.max(0, state.cooldowns[def.key] || 0),
            staminaCost: spec?.staminaCost || 12,
            ready: !state.cooldowns[def.key],
            kind: 'racial',
            slotLabel: `R${index + 1}`,
        };
    });
    const reactionDefs = buildState ? getBuildReactionDefs(buildState) : [];
    const reactionLines = reactionDefs.map((def) => {
        const cd = Math.max(0, state.cooldowns[def.key] || 0);
        const status = cd > 0 ? `${cd}T` : t3(lang, 'Lista', 'Ready', 'Gotovo');
        return `${shortLabel(getLocalizedText3(def.name, lang), 18)} ${status}`;
    });
    return {
        state,
        playerName: player.nickname,
        playerClass: player.class,
        playerRace: player.race,
        player: {
            currentHp: Math.max(0, player.hp),
            currentSta: Math.max(0, player.energy),
            maxHp: playerStats.maxHp,
            maxSta: playerStats.maxEnergy,
            attack: playerStats.attack,
            arcanePower: playerStats.arcanePower,
            defense: playerStats.defense,
            critChance: playerStats.critChance,
            evasion: playerStats.evasion,
            moveSpeed: playerStats.moveSpeed,
            baseDamage: playerStats.B_Damage,
            resistPhysical: playerStats.resistPhysical,
            resistArcane: playerStats.resistArcane,
        },
        enemy: {
            displayName: state.creature.displayName,
            category: state.creature.category,
            level: state.creature.level,
            currentHp: Math.max(0, state.creatureCurrentHp),
            maxHp: state.creature.maxHp,
            biomeName: state.creature.biomeName,
            ...enemyStats,
        },
        buildChoices,
        racialChoices,
        reactionLines,
        playerEffectLabels: state.playerEffects.map((entry) => `${shortLabel(entry.label, 16)} ${entry.remainingTurns}T`),
        enemyEffectLabels: state.enemyEffects.map((entry) => `${shortLabel(entry.label, 16)} ${entry.remainingTurns}T`),
    };
}
export async function getActivePveEncounterByPlayerId(playerId) {
    await ensurePveCombatSchema();
    return readEncounterByPlayerId(playerId);
}
export async function getActivePveEncounterByTgId(tgId) {
    await ensurePveCombatSchema();
    const player = await prisma.player.findUnique({
        where: { tgId },
        select: { id: true },
    });
    if (!player)
        return null;
    return readEncounterByPlayerId(player.id);
}
export async function getActivePveEncounterViewByPlayerId(playerId, lang) {
    await ensurePveCombatSchema();
    const state = await readEncounterByPlayerId(playerId);
    if (!state)
        return null;
    return computeEncounterViewFromState(state, lang);
}
export async function startPveEncounter(params) {
    const startedAt = Date.now();
    try {
        await ensurePveCombatSchema();
        const existing = await readEncounterByPlayerId(params.playerId);
        if (existing) {
            if (existing.creatureId === params.creatureId) {
                return {
                    success: true,
                    message: t3(params.lang, 'Ya estabas en ese combate.', 'You were already in that fight.', 'Ty uzhe v etom boyu.'),
                };
            }
            return {
                success: false,
                message: t3(params.lang, `Aun sigues peleando contra ${existing.creature.displayName}.`, `You are still fighting ${existing.creature.displayName}.`, `Ty vse eshche b'eshsya s ${existing.creature.displayName}.`),
            };
        }
        const creature = await getCreatureSnapshotById(params.creatureId, {
            worldMapId: params.worldMapId,
            x: params.x,
            y: params.y,
        });
        if (!creature || creature.status !== 'ALIVE') {
            return {
                success: false,
                message: t3(params.lang, 'La criatura ya no esta disponible.', 'That creature is no longer available.', 'Sushchestvo bolshe nedostupno.'),
            };
        }
        const player = await prisma.player.findUnique({
            where: { id: params.playerId },
            select: { hp: true, energy: true, mapX: true, mapY: true },
        });
        if (!player) {
            return {
                success: false,
                message: t3(params.lang, 'No pude leer tu perfil.', 'Could not read your profile.', 'Ne udalos prochitat profil.'),
            };
        }
        if (player.mapX !== params.x || player.mapY !== params.y) {
            return {
                success: false,
                message: t3(params.lang, 'Ya no estas en esa coordenada.', 'You are no longer on that tile.', 'Ty uzhe ne na etoy kletke.'),
            };
        }
        if (player.hp <= 0) {
            return {
                success: false,
                message: t3(params.lang, 'No puedes luchar con 0 HP.', 'You cannot fight at 0 HP.', 'Nelzya dratsya s 0 HP.'),
            };
        }
        const engagedBy = await getEncounterHolderByCreatureId(params.creatureId);
        if (engagedBy && engagedBy !== params.playerId) {
            return {
                success: false,
                message: t3(params.lang, 'Otro aventurero ya la tiene fijada en combate.', 'Another adventurer already engaged it.', 'Drugoy avantyurist uzhe v boju s ney.'),
            };
        }
        const initialState = {
            playerId: params.playerId,
            creatureId: creature.id,
            worldMapId: params.worldMapId,
            x: params.x,
            y: params.y,
            creature,
            creatureCurrentHp: creature.currentHp,
            turnNumber: 1,
            enemyIntent: createInitialIntent(creature, 1, params.lang),
            playerEffects: [],
            enemyEffects: [],
            cooldowns: {},
            log: [
                t3(params.lang, `⚔️ Empieza el combate contra ${creature.displayName}.`, `⚔️ Combat begins against ${creature.displayName}.`, `⚔️ Boy protiv ${creature.displayName} nachalsya.`),
                t3(params.lang, `💡 Estilo enemigo: ${describeCreatureStyle(creature, params.lang)}.`, `💡 Enemy style: ${describeCreatureStyle(creature, params.lang)}.`, `💡 Stil vraga: ${describeCreatureStyle(creature, params.lang)}.`),
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const serialized = serializeState(initialState);
        await prisma.$executeRawUnsafe(`INSERT OR IGNORE INTO "PlayerPveEncounter" (
        playerId, creatureId, worldMapId, tileX, tileY, creatureJson, creatureCurrentHp,
        turnNumber, enemyIntentJson, playerEffectsJson, enemyEffectsJson, cooldownsJson, logJson,
        createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`, serialized.playerId, serialized.creatureId, serialized.worldMapId, serialized.x, serialized.y, serialized.creatureJson, serialized.creatureCurrentHp, serialized.turnNumber, serialized.enemyIntentJson, serialized.playerEffectsJson, serialized.enemyEffectsJson, serialized.cooldownsJson, serialized.logJson);
        const inserted = await readEncounterByPlayerId(params.playerId);
        if (!inserted) {
            return {
                success: false,
                message: t3(params.lang, 'No pude iniciar el combate.', 'Could not start combat.', 'Ne udalos zapustit boy.'),
            };
        }
        if (inserted.creatureId !== params.creatureId) {
            return {
                success: false,
                message: t3(params.lang, 'Ya estabas en otro combate.', 'You were already in another fight.', 'Ty uzhe byl v drugom boyu.'),
            };
        }
        return {
            success: true,
            message: t3(params.lang, 'Combate iniciado. La presion sube si el duelo se alarga.', 'Combat started. Pressure rises if the duel drags on.', 'Boy nachat. Davlenie rastet, esli duel tyanetsya.'),
        };
    }
    finally {
        observePerf('pve.start', Date.now() - startedAt);
    }
}
export async function clearActivePveEncounter(playerId) {
    await ensurePveCombatSchema();
    await deleteEncounter(playerId);
}
//# sourceMappingURL=pve-combat.js.map