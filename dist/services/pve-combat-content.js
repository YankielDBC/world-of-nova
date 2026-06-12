// @ts-nocheck
import { getLocalizedText3, } from '../data/skill-trees.js';
import { RACIAL_TALENT_BALANCE } from '../data/racial-balance.js';
import { buildCreatureDefeatCard } from './creature-defeat.js';
import { clamp, effectSetToCombatModifiers, normalizeText, round1, shortLabel, t3, turnsFromSeconds, } from './pve-combat-utils.js';
import { formatCreatureRespawnLabel } from './creatures.js';
export function mapEnemyStats(base, modifiers) {
    const attackPct = modifiers.attackPct || 0;
    const arcanePct = modifiers.arcanePct || 0;
    const defensePct = modifiers.defensePct || 0;
    const movePct = modifiers.moveSpeedPct || 0;
    return {
        attack: round1(base.attack * (1 + attackPct) + (modifiers.attackFlat || 0)),
        arcanePower: round1(base.arcanePower * (1 + arcanePct) + (modifiers.arcaneFlat || 0)),
        defense: round1(base.defense * (1 + defensePct) + (modifiers.defenseFlat || 0)),
        critChance: clamp(round1(base.critChance + (modifiers.critChanceFlat || 0)), 0, 50),
        evasion: clamp(round1(base.evasion + (modifiers.evasionFlat || 0)), 0, 40),
        moveSpeed: round1(base.moveSpeed * (1 + movePct)),
    };
}
export function categoryBadge(category, lang) {
    if (category === 'boss')
        return lang === 'en' ? 'Boss' : lang === 'ru' ? 'Boss' : 'Boss';
    if (category === 'elite')
        return lang === 'en' ? 'Elite' : lang === 'ru' ? 'Elita' : 'Elite';
    if (category === 'veteran')
        return lang === 'en' ? 'Veteran' : lang === 'ru' ? 'Veteran' : 'Veterano';
    return lang === 'en' ? 'Basic' : lang === 'ru' ? 'Bazovyy' : 'Basico';
}
export function describeCreatureStyle(snapshot, lang) {
    const biome = normalizeText(snapshot.biomeName);
    if (biome === 'volcano' || biome === 'ashlands') {
        return t3(lang, 'golpe pesado y brasas', 'heavy hits and embers', 'tyazhelye udary i zhary');
    }
    if (biome === 'river' || biome === 'lake' || biome === 'swamp') {
        return t3(lang, 'desgaste y ritmo sucio', 'attrition and slippery tempo', 'iznos i skolzkiy temp');
    }
    if (biome === 'forest' || biome === 'plains') {
        return t3(lang, 'presion y caza directa', 'pressure and direct hunt', 'davlenie i pryamaya okhota');
    }
    if (biome === 'highlands' || biome === 'tundra') {
        return t3(lang, 'aguante y choque frontal', 'sturdiness and frontal clash', 'vyderzhka i frontalniy stolk');
    }
    return t3(lang, 'patron salvaje variable', 'wild shifting pattern', 'dikiy peremennyy pattern');
}
export function createInitialIntent(snapshot, turnNumber, lang) {
    const biome = normalizeText(snapshot.biomeName);
    const roll = Math.abs((snapshot.id * 31 + turnNumber * 17) % 100);
    let key = 'strike';
    if (snapshot.category === 'boss' && roll > 68) {
        key = 'heavy';
    }
    else if ((biome === 'volcano' || biome === 'ashlands') && roll > 54) {
        key = 'arcane';
    }
    else if ((biome === 'river' || biome === 'lake' || biome === 'swamp') && roll > 61) {
        key = 'guarded';
    }
    else if (roll > 78) {
        key = 'rush';
    }
    else if (roll > 58) {
        key = 'heavy';
    }
    if (key === 'heavy') {
        return {
            key,
            label: t3(lang, 'Golpe pesado', 'Heavy strike', 'Tyazhely udar'),
            hint: t3(lang, 'Cargara dano alto.', 'Preparing high damage.', 'Gotovit silnyy udar.'),
        };
    }
    if (key === 'arcane') {
        return {
            key,
            label: t3(lang, 'Descarga arcana', 'Arcane burst', 'Arkannyy vyplesk'),
            hint: t3(lang, 'Le brillan los ojos.', 'Arcane pressure is building.', 'Arkannoe davlenie rastet.'),
        };
    }
    if (key === 'guarded') {
        return {
            key,
            label: t3(lang, 'Guardia alta', 'High guard', 'Vysokaya zashchita'),
            hint: t3(lang, 'Subira defensa antes de morder.', 'It braces before striking.', 'Snachala ukreplyaetsya, potom beryot.'),
        };
    }
    if (key === 'rush') {
        return {
            key,
            label: t3(lang, 'Ritmo feroz', 'Predator rush', 'Khishnyy ryvok'),
            hint: t3(lang, 'Buscara velocidad y critico.', 'It looks ready to chase a crit.', 'Gotovitsya k bystromu kritu.'),
        };
    }
    return {
        key: 'strike',
        label: t3(lang, 'Ataque estable', 'Steady strike', 'Stabilnyy udar'),
        hint: t3(lang, 'Un golpe limpio sin adornos.', 'A clean direct hit.', 'Chistyy pryamoy udar.'),
    };
}
export function getRacialSkillSpec(race, key) {
    const normalizedRace = normalizeText(race);
    if (normalizedRace === 'zolk') {
        if (key === 'zolk_toxic_cloud') {
            return {
                durationTurns: 2,
                cooldownTurns: 4,
                staminaCost: 12,
                playerEffect: {
                    key,
                    label: 'Nube Toxica',
                    source: 'racial_active',
                    remainingTurns: 2,
                    modifiers: {
                        attackPct: RACIAL_TALENT_BALANCE.zolk.toxicCloudActive.attackPct,
                        arcanePct: RACIAL_TALENT_BALANCE.zolk.toxicCloudActive.arcanePct,
                    },
                },
                enemyEffect: {
                    key: `${key}_enemy`,
                    label: 'Toxina',
                    remainingTurns: 2,
                    modifiers: {
                        defensePct: -0.04,
                    },
                },
                immediateArcaneMultiplier: 0.3,
            };
        }
        if (key === 'zolk_mutation_dash') {
            return {
                durationTurns: 2,
                cooldownTurns: 4,
                staminaCost: 10,
                playerEffect: {
                    key,
                    label: 'Mutacion Dash',
                    source: 'racial_active',
                    remainingTurns: 2,
                    modifiers: {
                        moveSpeedPct: RACIAL_TALENT_BALANCE.zolk.mutationDashActive.moveSpeedPct,
                        evasionFlat: 4,
                    },
                    damageReductionPct: 0.12,
                },
            };
        }
        return null;
    }
    if (normalizedRace === 'uren') {
        if (key === 'uren_vine_snare') {
            return {
                durationTurns: 2,
                cooldownTurns: 4,
                staminaCost: 12,
                playerEffect: {
                    key,
                    label: 'Enredadera',
                    source: 'racial_active',
                    remainingTurns: 2,
                    modifiers: {
                        defensePct: RACIAL_TALENT_BALANCE.uren.vineSnareActive.defensePct,
                    },
                },
                enemyEffect: {
                    key: `${key}_enemy`,
                    label: 'Raices',
                    remainingTurns: 2,
                    modifiers: {
                        defensePct: -0.06,
                        evasionFlat: -2,
                    },
                },
                immediateAttackMultiplier: 0.25,
            };
        }
        if (key === 'uren_arcane_bud') {
            return {
                durationTurns: 2,
                cooldownTurns: 4,
                staminaCost: 12,
                playerEffect: {
                    key,
                    label: 'Brote Arcano',
                    source: 'racial_active',
                    remainingTurns: 2,
                    modifiers: {
                        attackPct: RACIAL_TALENT_BALANCE.uren.arcaneBudActive.attackPct,
                        arcanePct: RACIAL_TALENT_BALANCE.uren.arcaneBudActive.arcanePct,
                    },
                },
                immediateArcaneMultiplier: 0.35,
            };
        }
        return null;
    }
    return null;
}
export function getIntentModifiers(intent) {
    if (intent.key === 'heavy') {
        return {
            attackMultiplier: 1.18,
            critBonusPct: 5,
        };
    }
    if (intent.key === 'arcane') {
        return {
            attackMultiplier: 0.55,
            arcaneMultiplier: 0.95,
            critBonusPct: 3,
        };
    }
    if (intent.key === 'guarded') {
        return {
            attackMultiplier: 0.74,
            enemyDefensePct: 0.18,
        };
    }
    if (intent.key === 'rush') {
        return {
            attackMultiplier: 0.92,
            critBonusPct: 3,
            accuracyBonusPct: 5,
        };
    }
    return {
        attackMultiplier: 0.92,
    };
}
export function buildFleeText(lang, creatureName, success) {
    if (success) {
        return [
            t3(lang, '🏃 Retirada exitosa', '🏃 Successful retreat', '🏃 Uspeshnoe otstuplenie'),
            '✧═══••═══✧',
            t3(lang, `Te separas de ${creatureName} y recuperas distancia.`, `You break away from ${creatureName} and regain distance.`, `Ty otryvaeshsya ot ${creatureName} i snova derzhish distantsiyu.`),
        ].join('\n');
    }
    return [
        t3(lang, '🚫 No logras huir', '🚫 Retreat failed', '🚫 Otskok ne udalsya'),
        '✧═══••═══✧',
        t3(lang, `${creatureName} te cierra el paso y te obliga a seguir peleando.`, `${creatureName} cuts you off and keeps you in the fight.`, `${creatureName} otrezaet put i boy prodolzhaetsya.`),
    ].join('\n');
}
export function buildDefeatText(lang, creatureName, log) {
    const lines = [
        t3(lang, '☠️ Has caido', '☠️ You were defeated', '☠️ Ty pal'),
        '✧═══••═══✧',
        t3(lang, `${creatureName} te derriba. Logras arrastrarte con 1 HP.`, `${creatureName} knocks you down. You crawl away with 1 HP.`, `${creatureName} sbivaet tebya. Ty upolzaesh s 1 HP.`),
        '',
        t3(lang, '📜 Ultimos momentos', '📜 Final moments', '📜 Poslednie sekundy'),
        ...log.slice(-4).map((entry, index, arr) => `${index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├'} ${entry}`),
    ];
    return lines.join('\n');
}
export function buildVictoryText(lang, reward, log) {
    const rewardCard = buildCreatureDefeatCard(reward, lang);
    const lines = [rewardCard, '', t3(lang, '📜 Combate', '📜 Combat', '📜 Boy')];
    log.slice(-4).forEach((entry, index, arr) => {
        const marker = index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
        lines.push(`${marker} ${entry}`);
    });
    return lines.join('\n');
}
export function getBuildSkillSpec(def, rank, lang) {
    const active = def.activeConfig;
    const effect = effectSetToCombatModifiers(active.effects, Math.max(1, rank));
    let immediatePhysicalMultiplier = 0.88;
    let immediateArcaneMultiplier = 0.26;
    let critBonusPct = 1;
    let accuracyBonusPct = 0;
    if (normalizeText(def.classKey) === 'arcane') {
        immediatePhysicalMultiplier = 0.34;
        immediateArcaneMultiplier = 1.02;
        critBonusPct = 3;
    }
    else if (def.category === 'mobility') {
        immediatePhysicalMultiplier = 0.76;
        immediateArcaneMultiplier = 0.18;
        critBonusPct = 4;
        accuracyBonusPct = 8;
    }
    else if (def.category === 'defense' || def.category === 'utility') {
        immediatePhysicalMultiplier = 0.58;
        immediateArcaneMultiplier = 0.22;
        critBonusPct = 0;
    }
    else {
        immediatePhysicalMultiplier = 1.04;
        immediateArcaneMultiplier = 0.32;
        critBonusPct = 2;
    }
    return {
        durationTurns: turnsFromSeconds(active.durationSeconds),
        cooldownTurns: turnsFromSeconds(active.cooldownSeconds),
        staminaCost: clamp(8 + Math.ceil(active.durationSeconds / 6) + Math.ceil(active.cooldownSeconds / 20), 8, 18),
        playerEffect: {
            key: def.key,
            label: getLocalizedText3(def.name, lang),
            source: 'build_active',
            remainingTurns: turnsFromSeconds(active.durationSeconds),
            modifiers: effect,
        },
        immediatePhysicalMultiplier,
        immediateArcaneMultiplier,
        critBonusPct,
        accuracyBonusPct,
        narrative: active.castSeconds > 0
            ? t3(lang, `Canalizas ${getLocalizedText3(def.name, lang)} y entras en ritmo.`, `You channel ${getLocalizedText3(def.name, lang)} and enter the flow.`, `Ty kanaliziruesh ${getLocalizedText3(def.name, lang)} i vkhodish v ritm.`)
            : t3(lang, `Disparas ${getLocalizedText3(def.name, lang)} al instante.`, `You fire ${getLocalizedText3(def.name, lang)} instantly.`, `Ty mgnovenno primenyaesh ${getLocalizedText3(def.name, lang)}.`),
    };
}
export function getCreatureScoutText(snapshot, lang) {
    const biomeLabel = snapshot.biomeName.charAt(0).toUpperCase() + snapshot.biomeName.slice(1);
    const lines = [
        `👁️ ${snapshot.displayName}`,
        '✧═══••═══✧',
        `┌ ${categoryBadge(snapshot.category, lang)} · Lv ${snapshot.level}`,
        `├ 🌍 ${biomeLabel}`,
        `└ 💡 ${describeCreatureStyle(snapshot, lang)}`,
        '',
        `┌ ❤️ HP: ${snapshot.currentHp}/${snapshot.maxHp}`,
        `├ 🤺 ATK: ${snapshot.attack}   🛡 DEF: ${snapshot.defense}`,
        `├ 🔮 ARC: ${snapshot.arcanePower}   💢 Crit: ${snapshot.critChance}%`,
        `└ 🤸 Eva: ${snapshot.evasion}%   🚶 ${snapshot.moveSpeed} t/s`,
        '',
        `🏆 XP: +${snapshot.xpReward}`,
        `🪙 ${t3(lang, 'Monedas', 'Coins', 'Monety')}: ${snapshot.silverMin}-${snapshot.silverMax}`,
        `⏱ ${t3(lang, 'Respawn', 'Respawn', 'Respavn')}: ${formatCreatureRespawnLabel(snapshot.respawnSeconds, lang)}`,
    ];
    if (snapshot.drops.length > 0) {
        lines.push('');
        lines.push(`🎁 ${t3(lang, 'Loot probable', 'Likely loot', 'Veroyatnyy loot')}`);
        snapshot.drops.slice(0, 4).forEach((drop, index, arr) => {
            const marker = index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
            lines.push(`${marker} ${drop.emoji} ${shortLabel(drop.name, 18)} x${drop.minQty}-${drop.maxQty} (${drop.chancePct}%)`);
        });
    }
    return lines.join('\n');
}
//# sourceMappingURL=pve-combat-content.js.map