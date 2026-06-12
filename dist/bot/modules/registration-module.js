// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { detectLanguage, SUPPORTED_LANGUAGES, t } from '../../lib/i18n.js';
import { calculateCombatStats, createPlayer, getPlayerByTelegramId, prisma, updateLastActive } from '../../lib/db.js';
import { ensurePlayerBagSetup } from '../../services/bags.js';
import { ensurePlayerProgression } from '../../services/progression.js';
import { getTitleForLevel } from '../../types/player.js';
import { getClassAttributesAtLevel } from '../../lib/rpg-attributes.js';
import { clearConversationState, getConversationState, setConversationState, } from '../../lib/conversation-state.js';
const REGISTRATION_SCOPE = 'registration';
const RACES = {
    uren: {
        name: 'Uren',
        emoji: '🌑',
        description: 'Herejes del bosque oscuro. Druidas y arcanos que mezclan naturaleza corrupta con magia primordial.',
    },
    zolk: {
        name: 'Zolk',
        emoji: '🧪',
        description: 'Parias alquimicos supervivientes. Dominan toxinas, sabotaje y caceria adaptativa.',
    },
};
const CLASSES = {
    uren: {
        dark_druid: {
            name: 'Dark Druid',
            emoji: '🌿',
            description: 'Guardianes malditos del bosque. Resisten mucho, pero se mueven lento.',
            bonus: { str: 7, dex: 3, int: 5, vit: 9, agi: 4, eng: 5 },
        },
        arcane: {
            name: 'Arcane',
            emoji: '🔮',
            description: 'Canales de energia pura. Fragiles, pero con poder magico devastador.',
            bonus: { str: 1, dex: 5, int: 11, vit: 3, agi: 6, eng: 9 },
        },
    },
    zolk: {
        alchemist_rogue: {
            name: 'Alchemist Rogue',
            emoji: '🗡️',
            description: 'Sombras toxicas y tecnicas. Atacan rapido con viales y corrosivos.',
            bonus: { str: 4, dex: 9, int: 6, vit: 3, agi: 9, eng: 8 },
        },
        curse_hunter: {
            name: 'Curse Hunter',
            emoji: '🏹',
            description: 'Cazadores de maldiciones. Balanceados, resistentes y precisos.',
            bonus: { str: 8, dex: 6, int: 4, vit: 6, agi: 5, eng: 3 },
        },
    },
};
function getLevelOneAttributes(raceKey, classKey) {
    const computed = getClassAttributesAtLevel({
        race: raceKey,
        classKey,
        level: 1,
    });
    if (computed) {
        return computed;
    }
    const bonus = CLASSES[raceKey][classKey]?.bonus;
    if (!bonus) {
        return { str: 5, dex: 5, int: 5, vit: 5, agi: 5, eng: 5 };
    }
    return {
        str: 5 + bonus.str,
        dex: 5 + bonus.dex,
        int: 5 + bonus.int,
        vit: 5 + bonus.vit,
        agi: 5 + bonus.agi,
        eng: 5 + bonus.eng,
    };
}
async function ensureRaceCatalogSeeded() {
    for (const [raceKey, raceData] of Object.entries(RACES)) {
        const race = await prisma.race.upsert({
            where: { name: raceKey },
            update: {
                displayName: raceData.name,
                emoji: raceData.emoji,
                description: raceData.description,
            },
            create: {
                name: raceKey,
                displayName: raceData.name,
                emoji: raceData.emoji,
                description: raceData.description,
            },
        });
        const classes = CLASSES[raceKey];
        for (const [classKey, classData] of Object.entries(classes)) {
            const attrsLv1 = getLevelOneAttributes(raceKey, classKey);
            const statsLv1 = calculateCombatStats({
                race: raceKey,
                class: classKey,
                level: 1,
            });
            const statsLv2 = calculateCombatStats({
                race: raceKey,
                class: classKey,
                level: 2,
            });
            await prisma.raceClass.upsert({
                where: { raceId_name: { raceId: race.id, name: classKey } },
                update: {
                    displayName: classData.name,
                    emoji: classData.emoji,
                    description: classData.description,
                    baseHp: statsLv1.maxHp,
                    baseEnergy: statsLv1.maxEnergy,
                    baseSpeed: statsLv1.moveSpeed,
                    baseStr: attrsLv1.str,
                    baseDex: attrsLv1.dex,
                    baseInt: attrsLv1.int,
                    hpPerLevel: Math.max(1, statsLv2.maxHp - statsLv1.maxHp),
                    energyPerLevel: Math.max(1, statsLv2.maxEnergy - statsLv1.maxEnergy),
                },
                create: {
                    raceId: race.id,
                    name: classKey,
                    displayName: classData.name,
                    emoji: classData.emoji,
                    description: classData.description,
                    baseHp: statsLv1.maxHp,
                    baseEnergy: statsLv1.maxEnergy,
                    baseSpeed: statsLv1.moveSpeed,
                    baseStr: attrsLv1.str,
                    baseDex: attrsLv1.dex,
                    baseInt: attrsLv1.int,
                    hpPerLevel: Math.max(1, statsLv2.maxHp - statsLv1.maxHp),
                    energyPerLevel: Math.max(1, statsLv2.maxEnergy - statsLv1.maxEnergy),
                },
            });
        }
    }
}
async function getUserState(tgId) {
    return (await getConversationState(REGISTRATION_SCOPE, tgId)) || { state: 'none' };
}
async function setUserState(tgId, state) {
    await setConversationState(REGISTRATION_SCOPE, tgId, state, 60 * 60);
}
async function clearUserState(tgId) {
    await clearConversationState(REGISTRATION_SCOPE, tgId);
}
function buildRaceKeyboard() {
    return new InlineKeyboard()
        .text(`${RACES.uren.emoji} ${RACES.uren.name}`, 'race_uren')
        .row()
        .text(`${RACES.zolk.emoji} ${RACES.zolk.name}`, 'race_zolk');
}
function buildClassKeyboard(race) {
    const classes = CLASSES[race];
    const entries = Object.entries(classes);
    const keyboard = new InlineKeyboard();
    entries.forEach(([classKey, classData], index) => {
        keyboard.text(`${classData.emoji} ${classData.name}`, `class_${classKey}`);
        if (index < entries.length - 1) {
            keyboard.row();
        }
    });
    return keyboard;
}
function buildRacePrompt() {
    return [
        '🏛️ ELIGE TU RAZA',
        '',
        `${RACES.uren.emoji} UREN`,
        RACES.uren.description,
        '',
        `${RACES.zolk.emoji} ZOLK`,
        RACES.zolk.description,
    ].join('\n');
}
function buildClassPrompt(race) {
    const raceData = RACES[race];
    const classEntries = Object.entries(CLASSES[race]);
    const lines = [
        `${raceData.emoji} ${raceData.name.toUpperCase()} - ELIGE TU CLASE`,
        '',
        raceData.description,
        '',
    ];
    for (const [classKey, classData] of classEntries) {
        const attrs = getLevelOneAttributes(race, classKey);
        const stats = calculateCombatStats({
            race,
            class: classKey,
            level: 1,
        });
        lines.push(`${classData.emoji} ${classData.name}`);
        lines.push(classData.description);
        lines.push(`STR ${attrs.str} DEX ${attrs.dex} INT ${attrs.int} VIT ${attrs.vit} AGI ${attrs.agi} ENG ${attrs.eng}`);
        lines.push(`HP ${stats.maxHp} | STA ${stats.maxEnergy} | ATK ${stats.attack} | ARC ${stats.arcanePower} | MOV ${stats.moveSpeed}`);
        lines.push('');
    }
    return lines.join('\n').trim();
}
export function createRegistrationModule() {
    async function startRegistration(ctx, lang) {
        const tgId = ctx.from.id;
        const keyboard = new InlineKeyboard();
        const langs = Object.entries(SUPPORTED_LANGUAGES);
        for (const [code, { name, flag }] of langs) {
            keyboard.text(`${flag} ${name}`, `lang_${code}`);
            if (code !== langs[langs.length - 1][0]) {
                keyboard.row();
            }
        }
        await ctx.reply(t(lang, 'welcome'), {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
        await setUserState(tgId, { state: 'awaiting_nickname', selectedLang: lang });
    }
    async function handleNicknameInput(ctx) {
        const tgId = ctx.from.id;
        const state = await getUserState(tgId);
        const nickname = ctx.message.text?.trim();
        if (!nickname || nickname.length < 3 || nickname.length > 16) {
            await ctx.reply('❌ Nickname inválido (3-16 caracteres). Intenta de nuevo:');
            return;
        }
        const existing = await prisma.player.findFirst({
            where: { nickname: { equals: nickname } },
        });
        if (existing) {
            await ctx.reply('❌ Ese nickname ya está en uso. Elige otro:');
            return;
        }
        state.state = 'confirming_nickname';
        state.tempNickname = nickname;
        await setUserState(tgId, state);
        const keyboard = new InlineKeyboard().text('✅ Correcto', 'confirm_nickname').row().text('✏️ Cambiar', 'change_nickname');
        await ctx.reply(`🎯 Tu nickname será: *${nickname}*\n\n¿Está correcto?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    async function confirmNickname(ctx, confirm) {
        const tgId = ctx.from.id;
        const tgIdStr = String(tgId);
        const state = await getUserState(tgId);
        const nickname = state.tempNickname;
        if (!confirm) {
            state.state = 'awaiting_nickname';
            state.tempNickname = undefined;
            await setUserState(tgId, state);
            await ctx.reply('✏️ Ingresa tu nuevo nickname:');
            return;
        }
        const lang = state.selectedLang || 'es';
        const createdPlayer = await createPlayer({
            tgId: tgIdStr,
            tgUsername: ctx.from?.username,
            tgFirstName: ctx.from?.first_name,
            tgLastName: ctx.from?.last_name,
            tgLanguageCode: ctx.from?.language_code,
            nickname,
            language: lang,
        });
        await ensurePlayerBagSetup(createdPlayer.id);
        await ensurePlayerProgression(createdPlayer.id, true);
        await ctx.reply(buildRacePrompt(), {
            reply_markup: buildRaceKeyboard(),
        });
    }
    async function handleRaceSelection(ctx, race) {
        const tgIdStr = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgIdStr);
        if (!player || !player.nickname || player.race) {
            await ctx.reply('⚠️ Tu sesión expiró. Usa /start para comenzar de nuevo.');
            return;
        }
        if (!(race in RACES)) {
            await ctx.reply('❌ Raza inválida. Usa /start para comenzar de nuevo.');
            return;
        }
        const raceKey = race;
        await prisma.player.update({
            where: { tgId: tgIdStr },
            data: { race: raceKey },
        });
        await ctx.reply(buildClassPrompt(raceKey), {
            reply_markup: buildClassKeyboard(raceKey),
        });
    }
    async function handleClassSelection(ctx, classKey) {
        const tgIdStr = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgIdStr);
        if (!player || !player.nickname || !player.race || player.class) {
            await ctx.reply('⚠️ Tu sesión expiró. Usa /start para comenzar de nuevo.');
            return;
        }
        const raceKey = player.race;
        const classData = CLASSES[raceKey]?.[classKey];
        if (!classData) {
            await ctx.reply('❌ Clase inválida. Usa /start para comenzar de nuevo.');
            return;
        }
        const title = getTitleForLevel(1).title;
        const attrs = getLevelOneAttributes(raceKey, classKey);
        const stats = calculateCombatStats({
            race: raceKey,
            class: classKey,
            level: 1,
        });
        await prisma.player.update({
            where: { tgId: tgIdStr },
            data: {
                class: classKey,
                title,
                maxHp: stats.maxHp,
                hp: stats.maxHp,
                maxEnergy: stats.maxEnergy,
                energy: stats.maxEnergy,
                str: attrs.str,
                dex: attrs.dex,
                intelligence: attrs.int,
                vit: attrs.vit,
                eng: attrs.eng,
                wis: attrs.int,
                agi: attrs.agi,
                baseDamage: stats.B_Damage,
                critChance: stats.critChance,
                evasion: stats.evasion,
                atkSpeed: stats.atkSpeed,
                defense: stats.defense,
                resistPhysical: stats.resistPhysical,
                resistElemental: stats.resistElemental,
                resistArcane: stats.resistArcane,
                resistHoly: stats.resistHoly,
                resistChemical: stats.resistChemical,
                moveSpeed: stats.moveSpeed,
            },
        });
        const message = [
            '🎉 ¡Registro completo!',
            '',
            `👤 ${player.nickname}`,
            `🧬 ${RACES[raceKey].emoji} ${RACES[raceKey].name}`,
            `♟️ ${classData.emoji} ${classData.name}`,
            '',
            `STR ${attrs.str} | DEX ${attrs.dex} | INT ${attrs.int} | VIT ${attrs.vit} | AGI ${attrs.agi} | ENG ${attrs.eng}`,
            `HP ${stats.maxHp} | STA ${stats.maxEnergy} | ATK ${stats.attack} | ARC ${stats.arcanePower} | MOV ${stats.moveSpeed}`,
            '',
            '¡Bienvenido a World of Nova!',
        ].join('\n');
        await ctx.reply(message);
        await clearUserState(ctx.from.id);
    }
    async function handleStartCommand(ctx) {
        const fromId = ctx.from?.id;
        if (!fromId)
            return;
        try {
            await ensureRaceCatalogSeeded();
            const tgId = String(fromId);
            const player = await getPlayerByTelegramId(tgId);
            if (player) {
                if (player.nickname && !player.race) {
                    await ctx.reply(buildRacePrompt(), {
                        reply_markup: buildRaceKeyboard(),
                    });
                    return;
                }
                if (player.nickname && player.race && !player.class) {
                    const raceKey = player.race;
                    await ctx.reply(buildClassPrompt(raceKey), {
                        reply_markup: buildClassKeyboard(raceKey),
                    });
                    return;
                }
                await updateLastActive(tgId);
                const lang = player.language;
                await ctx.reply(t(lang, 'welcome').replace('🌌', '👋') + '\n\n' + `📋 *${player.nickname}* - Nivel ${player.level}`, { parse_mode: 'Markdown' });
                return;
            }
            const tgLang = ctx.from?.language_code;
            const lang = detectLanguage(tgLang);
            await startRegistration(ctx, lang);
        }
        catch (error) {
            console.error('Registration /start error:', error);
            await ctx.reply('❌ Error al iniciar. Intenta de nuevo.');
        }
    }
    async function handleCallback(ctx, callbackData) {
        const tgId = ctx.callbackQuery.from.id;
        if (callbackData.startsWith('lang_')) {
            const lang = callbackData.replace('lang_', '');
            const state = await getUserState(tgId);
            state.state = 'awaiting_nickname';
            state.selectedLang = lang;
            await setUserState(tgId, state);
            await ctx.answerCallbackQuery(`Idioma: ${SUPPORTED_LANGUAGES[lang].flag}`);
            if (ctx.callbackQuery.message) {
                await ctx.editMessageText(`${t(lang, 'languageSelected')} ${SUPPORTED_LANGUAGES[lang].flag} ${SUPPORTED_LANGUAGES[lang].name}`);
            }
            await ctx.reply(t(lang, 'nicknamePrompt'));
            return true;
        }
        if (callbackData === 'confirm_nickname') {
            await confirmNickname(ctx, true);
            await ctx.answerCallbackQuery();
            if (ctx.callbackQuery.message) {
                await ctx.api.editMessageReplyMarkup(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
            }
            return true;
        }
        if (callbackData === 'change_nickname') {
            await confirmNickname(ctx, false);
            await ctx.answerCallbackQuery();
            if (ctx.callbackQuery.message) {
                await ctx.api.editMessageReplyMarkup(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
            }
            return true;
        }
        if (callbackData.startsWith('race_')) {
            const race = callbackData.replace('race_', '');
            await ctx.answerCallbackQuery();
            if (ctx.callbackQuery.message) {
                await ctx.api.editMessageReplyMarkup(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
            }
            await handleRaceSelection(ctx, race);
            return true;
        }
        if (callbackData.startsWith('class_')) {
            const classKey = callbackData.replace('class_', '');
            await ctx.answerCallbackQuery();
            if (ctx.callbackQuery.message) {
                await ctx.api.editMessageReplyMarkup(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
            }
            await handleClassSelection(ctx, classKey);
            return true;
        }
        return false;
    }
    async function handleMessage(ctx) {
        const tgId = ctx.from.id;
        const state = await getUserState(tgId);
        if (state.state === 'awaiting_nickname') {
            await handleNicknameInput(ctx);
            return true;
        }
        if (state.state === 'confirming_nickname') {
            await ctx.reply('📝 Usa los botones para confirmar o cambiar.');
            return true;
        }
        return false;
    }
    return {
        handleStartCommand,
        handleCallback,
        handleMessage,
    };
}
//# sourceMappingURL=registration-module.js.map