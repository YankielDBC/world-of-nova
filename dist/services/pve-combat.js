import { prisma, calculateCombatStats } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { getCreatureSnapshotById, } from './creatures.js';
import { resolveCreatureDefeat } from './creature-defeat.js';
import { buildPveDeathCard, killPlayerAndCreateCorpse } from './death-system.js';
import { getLocalizedText3, } from '../data/skill-trees.js';
import { getPlayerBuildSkillState } from './build-skills.js';
import { getPlayerRacialTalentState, } from './racial-talents.js';
import { getGameplayEffectsForPlayer } from './gameplay-effects.js';
import { getPlayerEquipmentCombatModifiers } from './equipment.js';
import { aggregateEnemyEffects, aggregatePlayerEffects, clamp, mergeCombatModifiers, round1, shortLabel, t3, } from './pve-combat-utils.js';
import { buildFleeText, buildVictoryText, createInitialIntent, describeCreatureStyle, getBuildSkillSpec, getIntentModifiers, getRacialSkillSpec, mapEnemyStats, } from './pve-combat-content.js';
export { getCreatureScoutText } from './pve-combat-content.js';
import { deleteEncounter, ensurePveCombatSchema, getEncounterHolderByCreatureId, getPlayerFieldsForCombat, readEncounterByPlayerId, serializeState, writeEncounter, } from './pve-combat-state.js';
import { buildAttackDamage, buildCurrentEnemyStats, buildCurrentPlayerStats, buildEncounterLog, formatDamageOutcome, getBuildActiveDefs, getBuildReactionDefs, getBuildSkillStaminaCost, getPvePressurePct, getRacialActiveDefs, rollChance, tickCooldowns, tickEnemyEffects, tickPlayerEffects, triggerLocalReactions, updateEncounterCreature, } from './pve-combat-engine.js';
export { getPvePressurePct } from './pve-combat-engine.js';
async function computeEncounterViewFromState(state, lang) {
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
export async function resolvePveAction(params) {
    const startedAt = Date.now();
    try {
        await ensurePveCombatSchema();
        const state = await readEncounterByPlayerId(params.playerId);
        if (!state) {
            return {
                success: false,
                message: t3(params.lang, 'No tienes un combate activo.', 'You do not have an active combat.', 'U tebya net aktivnogo boya.'),
            };
        }
        const [view, buildState, racialState] = await Promise.all([
            computeEncounterViewFromState(state, params.lang),
            getPlayerBuildSkillState(params.playerId),
            getPlayerRacialTalentState(params.playerId),
        ]);
        if (!view) {
            await deleteEncounter(params.playerId);
            return {
                success: false,
                message: t3(params.lang, 'No pude reconstruir el combate.', 'Could not rebuild the combat.', 'Ne udalos vosstanovit boy.'),
            };
        }
        let playerHp = Math.max(0, view.player.currentHp);
        let playerSta = Math.max(0, view.player.currentSta);
        let enemyHp = Math.max(0, state.creatureCurrentHp);
        const roundLines = [];
        const pressurePct = getPvePressurePct(state.turnNumber);
        let appliedPlayerEffects = [];
        let appliedEnemyEffects = [];
        let appliedCooldowns = {};
        const currentPlayerEffects = [...state.playerEffects];
        const currentEnemyEffects = [...state.enemyEffects];
        const currentPlayerStats = buildCurrentPlayerStats(view, []);
        const currentEnemyStats = buildCurrentEnemyStats(view, []);
        const intentMods = getIntentModifiers(state.enemyIntent);
        const hitEnemyWith = (physicalMultiplier, arcaneMultiplier, extras) => {
            const enemyTarget = {
                defense: round1(currentEnemyStats.defense * (1 + (intentMods.enemyDefensePct || 0))),
                evasion: currentEnemyStats.evasion,
            };
            return buildAttackDamage(currentPlayerStats, enemyTarget, {
                physicalMultiplier,
                arcaneMultiplier,
                critBonusPct: extras?.critBonusPct || 0,
                accuracyBonusPct: extras?.accuracyBonusPct || 0,
                resistFlat: Math.max(0, Math.floor(currentEnemyStats.defense * 0.05)),
                damageBonusPct: pressurePct,
            });
        };
        if (params.action.kind === 'attack') {
            const staminaCost = 5;
            if (playerSta < staminaCost) {
                return {
                    success: false,
                    message: t3(params.lang, 'No tienes STA suficiente.', 'Not enough STA.', 'Nedostatochno STA.'),
                };
            }
            playerSta = Math.max(0, playerSta - staminaCost);
            const strike = hitEnemyWith(0.92, 0.18);
            enemyHp = Math.max(0, enemyHp - strike.damage);
            roundLines.push(t3(params.lang, `🫵 Ataque normal · STA -${staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `🫵 Basic attack · STA -${staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `🫵 Obychnaya ataka · STA -${staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`));
        }
        else if (params.action.kind === 'guard') {
            const staminaCost = 3;
            if (playerSta < staminaCost) {
                return {
                    success: false,
                    message: t3(params.lang, 'No tienes STA suficiente.', 'Not enough STA.', 'Nedostatochno STA.'),
                };
            }
            playerSta = Math.max(0, playerSta - staminaCost);
            appliedPlayerEffects.push({
                key: 'guard',
                label: t3(params.lang, 'Guardia alta', 'High guard', 'Vysokaya zashchita'),
                source: 'guard',
                remainingTurns: 1,
                modifiers: {
                    defensePct: 0.16,
                    evasionFlat: 1,
                },
                damageReductionPct: 0.34,
            });
            roundLines.push(t3(params.lang, `🛡 Guardia alta · STA -${staminaCost} · Mitigas el siguiente golpe.`, `🛡 High guard · STA -${staminaCost} · You soften the next hit.`, `🛡 Vysokaya zashchita · STA -${staminaCost} · Smyagchaesh sleduyushchiy udar.`));
        }
        else if (params.action.kind === 'flee') {
            const staminaCost = 4;
            if (playerSta < staminaCost) {
                return {
                    success: false,
                    message: t3(params.lang, 'No tienes STA suficiente.', 'Not enough STA.', 'Nedostatochno STA.'),
                };
            }
            playerSta = Math.max(0, playerSta - staminaCost);
            const fleeChance = clamp(34 +
                (currentPlayerStats.moveSpeed - currentEnemyStats.moveSpeed) * 240 +
                (currentPlayerStats.evasion - currentEnemyStats.evasion) * 0.55 -
                (state.creature.category === 'boss' ? 18 : state.creature.category === 'elite' ? 9 : 0), 14, 82);
            const escaped = rollChance(fleeChance);
            await prisma.player.update({
                where: { id: params.playerId },
                data: {
                    hp: Math.max(1, Math.min(currentPlayerStats.maxHp, playerHp)),
                    energy: Math.max(0, Math.min(currentPlayerStats.maxSta, playerSta)),
                },
            });
            if (escaped) {
                await deleteEncounter(params.playerId);
                return {
                    success: true,
                    outcome: 'fled',
                    text: buildFleeText(params.lang, state.creature.displayName, true),
                };
            }
            roundLines.push(t3(params.lang, `🏃 Intentas huir · STA -${staminaCost} · ${state.creature.displayName} te corta el paso.`, `🏃 You try to flee · STA -${staminaCost} · ${state.creature.displayName} cuts you off.`, `🏃 Ty pytaeshsya ubezhat · STA -${staminaCost} · ${state.creature.displayName} otrezaet put.`));
        }
        else if (params.action.kind === 'build_skill') {
            const actionKey = params.action.key;
            const def = buildState ? getBuildActiveDefs(buildState).find((entry) => entry.key === actionKey) : null;
            const rank = buildState?.ranksByKey[actionKey] || 0;
            if (!def || rank < 1 || !def.activeConfig) {
                return {
                    success: false,
                    message: t3(params.lang, 'Esa skill no esta disponible.', 'That skill is not available.', 'Etot navyk nedostupen.'),
                };
            }
            if ((state.cooldowns[def.key] || 0) > 0) {
                return {
                    success: false,
                    message: t3(params.lang, `Esa skill sigue en cooldown (${state.cooldowns[def.key]}T).`, `That skill is still on cooldown (${state.cooldowns[def.key]}T).`, `Navyk vse eshche na pereryadke (${state.cooldowns[def.key]}T).`),
                };
            }
            const spec = getBuildSkillSpec(def, rank, params.lang);
            if (playerSta < spec.staminaCost) {
                return {
                    success: false,
                    message: t3(params.lang, 'No tienes STA suficiente.', 'Not enough STA.', 'Nedostatochno STA.'),
                };
            }
            playerSta = Math.max(0, playerSta - spec.staminaCost);
            appliedPlayerEffects.push(spec.playerEffect);
            appliedCooldowns[def.key] = spec.cooldownTurns;
            const boostedPlayerStats = buildCurrentPlayerStats(view, [spec.playerEffect]);
            const strike = buildAttackDamage(boostedPlayerStats, {
                defense: round1(currentEnemyStats.defense * (1 + (intentMods.enemyDefensePct || 0))),
                evasion: currentEnemyStats.evasion,
            }, {
                physicalMultiplier: spec.immediatePhysicalMultiplier,
                arcaneMultiplier: spec.immediateArcaneMultiplier,
                critBonusPct: spec.critBonusPct,
                accuracyBonusPct: spec.accuracyBonusPct,
                damageBonusPct: pressurePct,
            });
            enemyHp = Math.max(0, enemyHp - strike.damage);
            roundLines.push(t3(params.lang, `✨ ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `✨ ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `✨ ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`));
        }
        else if (params.action.kind === 'racial_skill') {
            const actionKey = params.action.key;
            const def = racialState ? getRacialActiveDefs(racialState).find((entry) => entry.key === actionKey) : null;
            const rank = racialState?.ranksByKey[actionKey] || 0;
            if (!def || rank < 1) {
                return {
                    success: false,
                    message: t3(params.lang, 'Ese talento racial no esta listo.', 'That racial talent is not ready.', 'Etot rasovyy talant ne gotov.'),
                };
            }
            if ((state.cooldowns[def.key] || 0) > 0) {
                return {
                    success: false,
                    message: t3(params.lang, `Tu racial sigue en cooldown (${state.cooldowns[def.key]}T).`, `Your racial is still on cooldown (${state.cooldowns[def.key]}T).`, `Rasovaya sposobnost vse eshche na pereryadke (${state.cooldowns[def.key]}T).`),
                };
            }
            const spec = getRacialSkillSpec(view.playerRace, def.key);
            if (!spec) {
                return {
                    success: false,
                    message: t3(params.lang, 'Ese talento aun no tiene perfil PvE.', 'That talent has no PvE profile yet.', 'U etogo talanta eshche net PvE-profilya.'),
                };
            }
            if (playerSta < spec.staminaCost) {
                return {
                    success: false,
                    message: t3(params.lang, 'No tienes STA suficiente.', 'Not enough STA.', 'Nedostatochno STA.'),
                };
            }
            playerSta = Math.max(0, playerSta - spec.staminaCost);
            if (spec.playerEffect) {
                appliedPlayerEffects.push(spec.playerEffect);
            }
            if (spec.enemyEffect) {
                appliedEnemyEffects.push(spec.enemyEffect);
            }
            appliedCooldowns[def.key] = spec.cooldownTurns;
            const boostedPlayerStats = buildCurrentPlayerStats(view, spec.playerEffect ? [spec.playerEffect] : []);
            const strike = buildAttackDamage(boostedPlayerStats, {
                defense: currentEnemyStats.defense,
                evasion: currentEnemyStats.evasion,
            }, {
                physicalMultiplier: spec.immediateAttackMultiplier ?? 0.42,
                arcaneMultiplier: spec.immediateArcaneMultiplier ?? 0.22,
                critBonusPct: spec.immediateArcaneMultiplier ? 2 : 0,
                accuracyBonusPct: spec.enemyEffect ? 4 : 0,
                damageBonusPct: pressurePct,
            });
            enemyHp = Math.max(0, enemyHp - strike.damage);
            roundLines.push(t3(params.lang, `🧬 ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `🧬 ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`, `🧬 ${getLocalizedText3(def.name, params.lang)} · STA -${spec.staminaCost} · ${formatDamageOutcome({
                lang: params.lang,
                targetLabel: state.creature.displayName,
                damage: strike.damage,
                crit: strike.crit,
                evaded: strike.evaded,
            })}`));
        }
        if (enemyHp <= 0) {
            await prisma.player.update({
                where: { id: params.playerId },
                data: {
                    hp: Math.max(1, Math.min(currentPlayerStats.maxHp, playerHp)),
                    energy: Math.max(0, Math.min(currentPlayerStats.maxSta, playerSta)),
                },
            });
            const reward = await resolveCreatureDefeat({
                playerId: params.playerId,
                worldMapId: state.worldMapId,
                x: state.x,
                y: state.y,
                creatureId: state.creatureId,
                lang: params.lang,
            });
            await deleteEncounter(params.playerId);
            if (!reward.success) {
                return {
                    success: false,
                    message: reward.message,
                };
            }
            return {
                success: true,
                outcome: 'victory',
                reward,
                text: buildVictoryText(params.lang, reward, buildEncounterLog(state.log, roundLines)),
            };
        }
        const playerEffectsForEnemyTurn = [...currentPlayerEffects, ...appliedPlayerEffects];
        const enemyEffectsForEnemyTurn = [...currentEnemyEffects, ...appliedEnemyEffects];
        const enemyTurnPlayerStats = buildCurrentPlayerStats(view, appliedPlayerEffects);
        const enemyTurnEnemyStats = buildCurrentEnemyStats(view, appliedEnemyEffects);
        const playerAggregate = aggregatePlayerEffects(playerEffectsForEnemyTurn);
        const enemyDamage = buildAttackDamage({
            attack: enemyTurnEnemyStats.attack,
            arcanePower: enemyTurnEnemyStats.arcanePower,
            critChance: enemyTurnEnemyStats.critChance,
        }, {
            defense: enemyTurnPlayerStats.defense,
            evasion: enemyTurnPlayerStats.evasion,
        }, {
            physicalMultiplier: intentMods.attackMultiplier ?? 0.9,
            arcaneMultiplier: intentMods.arcaneMultiplier ?? 0.22,
            critBonusPct: intentMods.critBonusPct ?? 0,
            accuracyBonusPct: intentMods.accuracyBonusPct ?? 0,
            resistFlat: Math.floor(enemyTurnPlayerStats.resistPhysical * 0.45) +
                Math.floor(enemyTurnPlayerStats.resistArcane * ((intentMods.arcaneMultiplier || 0) > 0.3 ? 0.2 : 0.06)),
            damageReductionPct: playerAggregate.damageReductionPct,
            damageBonusPct: pressurePct,
            forceCritBlock: playerEffectsForEnemyTurn.some((entry) => entry.key === 'guard') &&
                state.enemyIntent.key === 'heavy',
        });
        playerHp = Math.max(0, playerHp - enemyDamage.damage);
        roundLines.push(t3(params.lang, `👹 ${state.enemyIntent.label} · ${formatDamageOutcome({
            lang: params.lang,
            targetLabel: 'ti',
            damage: enemyDamage.damage,
            crit: enemyDamage.crit,
            evaded: enemyDamage.evaded,
            blockedCrit: enemyDamage.blockedCrit,
        })}`, `👹 ${state.enemyIntent.label} · ${formatDamageOutcome({
            lang: params.lang,
            targetLabel: 'you',
            damage: enemyDamage.damage,
            crit: enemyDamage.crit,
            evaded: enemyDamage.evaded,
            blockedCrit: enemyDamage.blockedCrit,
        })}`, `👹 ${state.enemyIntent.label} · ${formatDamageOutcome({
            lang: params.lang,
            targetLabel: 'tebe',
            damage: enemyDamage.damage,
            crit: enemyDamage.crit,
            evaded: enemyDamage.evaded,
            blockedCrit: enemyDamage.blockedCrit,
        })}`));
        const hpPctAfterHit = enemyTurnPlayerStats.maxHp > 0 ? (playerHp / enemyTurnPlayerStats.maxHp) * 100 : 0;
        const staPctAfterHit = enemyTurnPlayerStats.maxSta > 0 ? (playerSta / enemyTurnPlayerStats.maxSta) * 100 : 0;
        let reactionEvent = null;
        if (enemyDamage.evaded && enemyDamage.crit) {
            reactionEvent = 'on_crit_evaded';
        }
        else if (enemyDamage.blockedCrit) {
            reactionEvent = 'on_crit_blocked';
        }
        else if (enemyDamage.crit) {
            reactionEvent = 'on_crit_taken';
        }
        else if (enemyDamage.damage > 0) {
            reactionEvent = 'on_hit_taken';
        }
        if (reactionEvent) {
            const reaction = await triggerLocalReactions({
                lang: params.lang,
                buildState,
                hpPct: hpPctAfterHit,
                staPct: staPctAfterHit,
                event: reactionEvent,
                cooldowns: {
                    ...state.cooldowns,
                    ...appliedCooldowns,
                },
                playerEffects: playerEffectsForEnemyTurn,
            });
            roundLines.push(...reaction.log);
            appliedPlayerEffects = reaction.playerEffects.filter((entry) => !currentPlayerEffects.some((existing) => existing.key === entry.key && existing.label === entry.label));
            appliedCooldowns = {
                ...appliedCooldowns,
                ...reaction.cooldowns,
            };
            if (reaction.counterAttackRatio > 0 && playerHp > 0) {
                const counterStats = buildCurrentPlayerStats(view, appliedPlayerEffects);
                const counterHit = buildAttackDamage(counterStats, {
                    defense: enemyTurnEnemyStats.defense,
                    evasion: enemyTurnEnemyStats.evasion,
                }, {
                    physicalMultiplier: Math.max(0.28, reaction.counterAttackRatio),
                    arcaneMultiplier: Math.max(0.08, reaction.counterAttackRatio * 0.22),
                    critBonusPct: 1,
                    accuracyBonusPct: 6,
                    damageBonusPct: pressurePct,
                });
                enemyHp = Math.max(0, enemyHp - counterHit.damage);
                roundLines.push(t3(params.lang, `↩ Contraataque · ${formatDamageOutcome({
                    lang: params.lang,
                    targetLabel: state.creature.displayName,
                    damage: counterHit.damage,
                    crit: counterHit.crit,
                    evaded: counterHit.evaded,
                })}`, `↩ Counterattack · ${formatDamageOutcome({
                    lang: params.lang,
                    targetLabel: state.creature.displayName,
                    damage: counterHit.damage,
                    crit: counterHit.crit,
                    evaded: counterHit.evaded,
                })}`, `↩ Kontrataka · ${formatDamageOutcome({
                    lang: params.lang,
                    targetLabel: state.creature.displayName,
                    damage: counterHit.damage,
                    crit: counterHit.crit,
                    evaded: counterHit.evaded,
                })}`));
            }
        }
        if (enemyHp <= 0) {
            await prisma.player.update({
                where: { id: params.playerId },
                data: {
                    hp: Math.max(1, Math.min(enemyTurnPlayerStats.maxHp, playerHp)),
                    energy: Math.max(0, Math.min(enemyTurnPlayerStats.maxSta, playerSta)),
                },
            });
            const reward = await resolveCreatureDefeat({
                playerId: params.playerId,
                worldMapId: state.worldMapId,
                x: state.x,
                y: state.y,
                creatureId: state.creatureId,
                lang: params.lang,
            });
            await deleteEncounter(params.playerId);
            if (!reward.success) {
                return {
                    success: false,
                    message: reward.message,
                };
            }
            return {
                success: true,
                outcome: 'victory',
                reward,
                text: buildVictoryText(params.lang, reward, buildEncounterLog(state.log, roundLines)),
            };
        }
        if (playerHp <= 0) {
            const playerIdentity = await prisma.player.findUnique({
                where: { id: params.playerId },
                select: { tgId: true },
            });
            if (!playerIdentity) {
                await deleteEncounter(params.playerId);
                return {
                    success: false,
                    message: t3(params.lang, 'No pude sellar tu derrota correctamente.', 'Could not seal your defeat correctly.', 'Ne udalos korrektno zafiksirovat porazhenie.'),
                };
            }
            const deathOutcome = await killPlayerAndCreateCorpse({
                playerId: params.playerId,
                tgId: playerIdentity.tgId,
                worldMapId: state.worldMapId,
                deathX: state.x,
                deathY: state.y,
            });
            await deleteEncounter(params.playerId);
            return {
                success: true,
                outcome: 'defeat',
                text: buildPveDeathCard(params.lang, deathOutcome, buildEncounterLog(state.log, roundLines)),
            };
        }
        const persistedRoundLines = roundLines;
        const nextState = updateEncounterCreature({
            ...state,
            turnNumber: state.turnNumber + 1,
            enemyIntent: createInitialIntent(state.creature, state.turnNumber + 1, params.lang),
            playerEffects: tickPlayerEffects([...currentPlayerEffects, ...appliedPlayerEffects]),
            enemyEffects: tickEnemyEffects([...currentEnemyEffects, ...appliedEnemyEffects]),
            cooldowns: {
                ...tickCooldowns(state.cooldowns),
                ...appliedCooldowns,
            },
            log: buildEncounterLog(state.log, persistedRoundLines),
            updatedAt: new Date(),
        }, enemyHp);
        await writeEncounter(nextState);
        await prisma.player.update({
            where: { id: params.playerId },
            data: {
                hp: Math.max(1, Math.min(enemyTurnPlayerStats.maxHp, playerHp)),
                energy: Math.max(0, Math.min(enemyTurnPlayerStats.maxSta, playerSta)),
            },
        });
        return {
            success: true,
            outcome: 'active',
            notice: persistedRoundLines.join('\n') || undefined,
        };
    }
    finally {
        observePerf('pve.resolve', Date.now() - startedAt);
    }
}
