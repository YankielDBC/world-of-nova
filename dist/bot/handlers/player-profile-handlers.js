import { InlineKeyboard } from 'grammy';
import { resolvePlayerDisplayTitle } from './player-misc-handlers.js';
export function createPlayerProfileHandlers(deps) {
    const mergeCombatModifiers = (...entries) => {
        const merged = {};
        for (const entry of entries) {
            if (!entry)
                continue;
            for (const [key, value] of Object.entries(entry)) {
                const numeric = Number(value || 0);
                if (!Number.isFinite(numeric))
                    continue;
                merged[key] = (merged[key] || 0) + numeric;
            }
        }
        return merged;
    };
    return {
        handleProfile: async (ctx) => {
            const tgId = String(ctx.from.id);
            const player = await deps.getPlayerByTelegramId(tgId);
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return;
            }
            await deps.ensurePlayerProgression(player.id, true);
            const worldMap = await deps.getCanonicalWorldMap();
            const currentTile = await deps.getOrCreateTile(worldMap.id, player.mapX, player.mapY);
            const place = await deps.getPlaceAtCoords(player.mapX, player.mapY);
            const [raceRow, raceClass] = await Promise.all([
                player.race
                    ? deps.prisma.race.findFirst({
                        where: { name: player.race },
                    })
                    : null,
                player.class
                    ? deps.prisma.raceClass.findFirst({
                        where: player.race
                            ? {
                                name: player.class,
                                race: { name: player.race },
                            }
                            : {
                                name: player.class,
                            },
                    })
                    : null,
            ]);
            const gameplayEffects = await deps.getGameplayEffectsForPlayer(player.id);
            const equipmentModifiers = await deps.getPlayerEquipmentCombatModifiers(player.id);
            const stats = deps.calculateCombatStats(player, mergeCombatModifiers(gameplayEffects.combatModifiers, equipmentModifiers));
            const lang = deps.getPlayerLanguage(player ?? undefined);
            const dictRace = deps.getRaceEntry(player.race);
            const raceName = raceRow?.displayName ||
                dictRace?.name ||
                deps.formatTokenName(player.race, deps.t(lang, 'profileUnknown'));
            const raceEmoji = raceRow?.emoji || deps.profileEmoji;
            const dictClass = deps.getClassEntry(player.class);
            const className = raceClass?.displayName ||
                dictClass?.name ||
                deps.formatClassName(player.class, deps.t(lang, 'profileNoClass'));
            const classEmoji = raceClass?.emoji || dictClass?.emoji || deps.classEmoji;
            const profileTitle = resolvePlayerDisplayTitle(player.title, player.level, className);
            const deathLocationOverride = await deps.getDeathSummaryForProfile(tgId);
            const locationName = deathLocationOverride
                ? deathLocationOverride
                : currentTile
                    ? deps.getLocationDisplayLabel(currentTile, place, lang)
                    : place?.displayName || 'Unknown';
            const bagUsage = await deps.getActiveBagUsage(player.id);
            const message = deps.buildProfileCard({
                nickname: player.nickname,
                title: profileTitle,
                profileEmoji: raceEmoji,
                raceName,
                raceEmoji,
                className,
                classEmoji,
                x: player.mapX,
                y: player.mapY,
                locationName,
                level: player.level,
                currentXp: player.currentXp,
                requiredXp: deps.getRequiredXpForLevel(player.level),
                hp: player.hp,
                maxHp: stats.maxHp,
                stamina: player.energy,
                maxStamina: stats.maxEnergy,
                strength: stats.attributes.str,
                dexterity: stats.attributes.dex,
                intelligence: stats.attributes.int,
                vitality: stats.attributes.vit,
                agility: stats.attributes.agi,
                engineering: stats.attributes.eng,
                baseDamage: stats.B_Damage,
                critChance: stats.critChance,
                evasion: stats.evasion,
                atkSpeed: stats.atkSpeed,
                attack: stats.attack,
                arcanePower: stats.arcanePower,
                defense: stats.defense,
                resistPhysical: stats.resistPhysical,
                resistElemental: stats.resistElemental,
                resistArcane: stats.resistArcane,
                resistHoly: stats.resistHoly,
                resistChemical: stats.resistChemical,
                moveSpeed: stats.moveSpeed,
                gold: player.gold,
                silver: player.silver,
                usedSlots: bagUsage?.usedSlots ?? 0,
                totalSlots: bagUsage?.totalSlots ?? 0,
                usedWeightKg: bagUsage?.usedWeightKg ?? 0,
                totalWeightKg: bagUsage?.totalWeightKg ?? 0,
            }, lang);
            await ctx.reply(message);
        },
        handleLanguageChange: async (ctx) => {
            const tgId = String(ctx.from.id);
            const player = await deps.getPlayerByTelegramId(tgId);
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return;
            }
            const currentLang = deps.getPlayerLanguage(player ?? undefined);
            const keyboard = new InlineKeyboard();
            const langs = Object.entries(deps.supportedLanguages);
            for (const [code, { name, flag }] of langs) {
                const prefix = code === currentLang ? '✅ ' : '';
                keyboard.text(`${prefix}${flag} ${name}`, `setlang_${code}`);
            }
            await deps.updateLanguageMessage(ctx, deps.t(currentLang, 'settingsLanguage'), keyboard);
        },
    };
}
