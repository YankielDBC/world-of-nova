// @ts-nocheck
import { getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { compactText } from '../../lib/ui-compact.js';
import { EMOJIS } from '../../data/emojis.js';
import { calculateDepositFeeSilver, depositToVaultWithFee, getVaultOverview, listVaultMoveEntries, moveVaultObject, withdrawFromVault, } from '../../services/crown-bank.js';
import { clearConversationState, getConversationState, setConversationState } from '../../lib/conversation-state.js';
import { BANK_SCOPE, buildBankHubKeyboard, buildBankMoneyAmountKeyboard, buildBankMoneyConfirmKeyboard, buildBankMoneyDirectionKeyboard, buildBankObjectDirectionKeyboard, buildBankObjectListKeyboard, getPlayerLanguage, getVaultProfileByBuildingKey, isVillageChest, isPlayerAtPlaceById, parseBankMoneyInput, sendBankScreen, } from './bank-module-helpers.js';
export function createBankModule() {
    async function getBankState(playerTgId) {
        return getConversationState(BANK_SCOPE, playerTgId);
    }
    async function setBankState(playerTgId, state) {
        await setConversationState(BANK_SCOPE, playerTgId, state, 30 * 60);
    }
    async function clearBankState(playerTgId) {
        await clearConversationState(BANK_SCOPE, playerTgId);
    }
    async function loadBankContext(ctx, placeId) {
        const player = await getPlayerByTelegramId(String(ctx.from.id));
        if (!player) {
            await ctx.reply(t('es', 'errorNotRegistered'));
            return null;
        }
        const lang = getPlayerLanguage(player);
        if (!(await isPlayerAtPlaceById(player, placeId))) {
            await clearBankState(ctx.from.id);
            await ctx.reply(t(lang, 'placeNotAt'));
            return null;
        }
        return { player, lang };
    }
    async function handleBankHub(ctx, params) {
        const context = await loadBankContext(ctx, params.placeId);
        if (!context) {
            return;
        }
        const { player } = context;
        const vaultProfile = getVaultProfileByBuildingKey(params.buildingKey);
        await clearBankState(ctx.from.id);
        const overview = await getVaultOverview(player.id, vaultProfile);
        const lines = vaultProfile === 'village'
            ? [
                '🧰 Baul del Pueblo',
                '✧═══••═══✧',
                'Gestiona tus objetos en un baul compacto de 10 slots.',
                '',
                `${EMOJIS.ui.stats} Resumen`,
                `┌📦 Objetos: ${overview.objectStacks} stacks (${overview.objectUnits} uds)`,
                `├🎯 Valor mercado: ≈ ${overview.marketValueSilver} ${EMOJIS.ui.silver}`,
                `└🧰 Slots: ${overview.usedSlots}/${overview.totalSlots}`,
            ]
            : [
                '🏦 Camara de la Corona',
                '✧═══••═══✧',
                'Administra tu fortuna y tus objetos en una sola boveda segura.',
                '',
                `${EMOJIS.ui.stats} Resumen`,
                `┌📦 Objetos: ${overview.objectStacks} stacks (${overview.objectUnits} uds)`,
                `├🎯 Valor mercado: ≈ ${overview.marketValueSilver} ${EMOJIS.ui.silver}`,
                `├🏦 Slots: ${overview.usedSlots}/${overview.totalSlots}`,
                `├🖐️ Mano: ${EMOJIS.ui.gold} ${overview.summary.carried.gold} | ${EMOJIS.ui.silver} ${overview.summary.carried.silver}`,
                `└🏦 Boveda: ${EMOJIS.ui.gold} ${overview.summary.vault.gold} | ${EMOJIS.ui.silver} ${overview.summary.vault.silver}`,
            ];
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendBankScreen(ctx, params.mode, lines.join('\n'), buildBankHubKeyboard(params.placeId, params.buildingKey, context.lang));
    }
    async function renderBankObjectDirectionMenu(ctx, params) {
        const context = await loadBankContext(ctx, params.placeId);
        if (!context) {
            return;
        }
        await clearBankState(ctx.from.id);
        const vaultProfile = params.vaultProfile || getVaultProfileByBuildingKey(params.buildingKey);
        const containerLabel = vaultProfile === 'village' ? 'Baul' : 'Boveda';
        const overview = await getVaultOverview(context.player.id, vaultProfile);
        const lines = [
            '📦 Administrar Boveda',
            '✧═══••═══✧',
            'Elige la direccion del movimiento:',
            `${EMOJIS.ui.bag} Mochila -> 🏦 Boveda`,
            `🏦 Boveda -> ${EMOJIS.ui.bag} Mochila`,
            '',
            `🏦 Slots boveda: ${overview.usedSlots}/${overview.totalSlots}`,
            `🖐️ Mano: ${EMOJIS.ui.gold} ${overview.summary.carried.gold} | ${EMOJIS.ui.silver} ${overview.summary.carried.silver}`,
            `🏦 Cuenta: ${EMOJIS.ui.gold} ${overview.summary.vault.gold} | ${EMOJIS.ui.silver} ${overview.summary.vault.silver}`,
        ];
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendBankScreen(ctx, params.mode, lines.join('\n'), buildBankObjectDirectionKeyboard(params.placeId, params.buildingKey));
    }
    async function renderBankObjectList(ctx, params) {
        const context = await loadBankContext(ctx, params.placeId);
        if (!context) {
            return;
        }
        const vaultProfile = params.vaultProfile || getVaultProfileByBuildingKey(params.buildingKey);
        const { entries, overview } = await listVaultMoveEntries(context.player.id, params.direction, vaultProfile);
        await setBankState(ctx.from.id, {
            phase: 'object_listing',
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            vaultProfile,
            direction: params.direction,
            entries,
        });
        const directionLabel = params.direction === 'bag_to_vault' ? `${EMOJIS.ui.bag} -> 🏦` : `🏦 -> ${EMOJIS.ui.bag}`;
        const lines = [
            `📦 Mover Objetos ${directionLabel}`,
            '✧═══••═══✧',
            `🏦 Boveda: ${overview.usedSlots}/${overview.totalSlots} slots`,
            `🎯 Valor mercado: ≈ ${overview.marketValueSilver} ${EMOJIS.ui.silver}`,
            '',
            'Tip: /bo_x mueve 1 unidad.',
            'Tip: /bo_x N mueve N unidades.',
            '',
            '📄 Lista',
            '┌────────┐',
        ];
        if (vaultProfile === 'village') {
            lines[2] = `🧰 Baul: ${overview.usedSlots}/${overview.totalSlots} slots`;
        }
        if (entries.length === 0) {
            lines.push('└ No hay objetos para mover en esta direccion.');
        }
        else {
            for (const entry of entries) {
                const marker = entry.listIndex === entries.length ? '└' : '├';
                const code = String(entry.listIndex).padStart(2, '0');
                const qtyLabel = entry.quantity > 1 ? ` x${entry.quantity}` : '';
                lines.push(`${marker} #${code} ${entry.emoji} ${compactText(entry.name, 16)}${qtyLabel}  /bo_${entry.listIndex}`);
            }
        }
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendBankScreen(ctx, params.mode, lines.join('\n'), buildBankObjectListKeyboard(params.placeId, params.buildingKey));
    }
    async function renderBankMoneyDirectionMenu(ctx, params) {
        const context = await loadBankContext(ctx, params.placeId);
        if (!context) {
            return;
        }
        const vaultProfile = getVaultProfileByBuildingKey(params.buildingKey);
        if (vaultProfile === 'village') {
            await handleBankHub(ctx, {
                mode: params.mode,
                placeId: params.placeId,
                buildingKey: params.buildingKey,
                infoLine: '⚠️ El baul del pueblo no gestiona dinero.',
            });
            return;
        }
        await clearBankState(ctx.from.id);
        const overview = await getVaultOverview(context.player.id, vaultProfile);
        const lines = [
            `${EMOJIS.ui.gold} Mover Dinero`,
            '✧═══••═══✧',
            'Selecciona si quieres depositar o retirar.',
            'Fee deposito:',
            `• Hasta 100${EMOJIS.ui.silver} eq: 5% (se paga en plata)`,
            `• Mas de 100${EMOJIS.ui.silver} eq: 10${EMOJIS.ui.silver} fijo`,
            '• Retiro: sin fee',
            '',
            `🖐️ Mano: ${EMOJIS.ui.gold} ${overview.summary.carried.gold} | ${EMOJIS.ui.silver} ${overview.summary.carried.silver}`,
            `🏦 Boveda: ${EMOJIS.ui.gold} ${overview.summary.vault.gold} | ${EMOJIS.ui.silver} ${overview.summary.vault.silver}`,
        ];
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendBankScreen(ctx, params.mode, lines.join('\n'), buildBankMoneyDirectionKeyboard(params.placeId, params.buildingKey));
    }
    async function startBankMoneyAmountPrompt(ctx, params) {
        const context = await loadBankContext(ctx, params.placeId);
        if (!context) {
            return;
        }
        if (isVillageChest(params.buildingKey)) {
            await handleBankHub(ctx, {
                mode: params.mode,
                placeId: params.placeId,
                buildingKey: params.buildingKey,
                infoLine: '⚠️ El baul del pueblo no gestiona dinero.',
            });
            return;
        }
        await setBankState(ctx.from.id, {
            phase: 'money_amount',
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            direction: params.direction,
        });
        const actionLabel = params.direction === 'deposit' ? 'Depositar' : 'Retirar';
        const lines = [
            `${EMOJIS.ui.gold} ${actionLabel} Dinero`,
            '✧═══••═══✧',
            'Escribe el monto y moneda:',
            'Ej: 50 s  (plata)',
            'Ej: 1 g   (oro)',
            '',
            params.direction === 'deposit'
                ? 'Recuerda: el fee de deposito siempre se cobra en plata.'
                : 'Retirar no tiene fee.',
        ];
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendBankScreen(ctx, params.mode, lines.join('\n'), buildBankMoneyAmountKeyboard(params.placeId, params.buildingKey));
    }
    async function cancelBankMoneyTransfer(ctx, mode) {
        const state = await getBankState(ctx.from.id);
        if (!state) {
            return;
        }
        if (state.phase === 'money_confirm' || state.phase === 'money_amount') {
            await startBankMoneyAmountPrompt(ctx, {
                mode,
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                direction: state.direction,
                infoLine: '❌ Operacion cancelada.',
            });
            return;
        }
        await handleBankHub(ctx, {
            mode,
            placeId: state.placeId,
            buildingKey: state.buildingKey,
            infoLine: '❌ Operacion cancelada.',
        });
    }
    async function confirmBankMoneyTransfer(ctx) {
        const state = await getBankState(ctx.from.id);
        if (!state || state.phase !== 'money_confirm') {
            await ctx.reply('No hay transferencia de dinero pendiente.');
            return;
        }
        const context = await loadBankContext(ctx, state.placeId);
        if (!context) {
            return;
        }
        const { player } = context;
        const result = state.direction === 'deposit'
            ? await depositToVaultWithFee(player.id, state.currency, state.amount)
            : await withdrawFromVault(player.id, state.currency, state.amount);
        if (!result.success) {
            await startBankMoneyAmountPrompt(ctx, {
                mode: 'edit',
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                direction: state.direction,
                infoLine: `⚠️ ${result.message}`,
            });
            return;
        }
        const currencyLabel = state.currency === 'GOLD' ? 'oro' : 'plata';
        const summaryLine = state.direction === 'deposit'
            ? `✅ Depositaste ${state.amount} ${currencyLabel}. Fee: ${state.feeSilver} ${EMOJIS.ui.silver}.`
            : `✅ Retiraste ${state.amount} ${currencyLabel} sin fee.`;
        await handleBankHub(ctx, {
            mode: 'edit',
            placeId: state.placeId,
            buildingKey: state.buildingKey,
            infoLine: summaryLine,
        });
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData.startsWith('bank_manage:')) {
            const payload = callbackData.replace('bank_manage:', '');
            const [placeIdRaw, buildingKey] = payload.split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            await ctx.answerCallbackQuery();
            await handleBankHub(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
            });
            return true;
        }
        if (callbackData.startsWith('bank_objects:')) {
            const payload = callbackData.replace('bank_objects:', '');
            const [placeIdRaw, buildingKey] = payload.split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            await ctx.answerCallbackQuery();
            await renderBankObjectDirectionMenu(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
            });
            return true;
        }
        if (callbackData.startsWith('bank_object_dir:')) {
            const payload = callbackData.replace('bank_object_dir:', '');
            const [placeIdRaw, buildingKey, directionRaw] = payload.split('|');
            const placeId = Number(placeIdRaw);
            const direction = directionRaw;
            if (!Number.isFinite(placeId) || !buildingKey || (direction !== 'bag_to_vault' && direction !== 'vault_to_bag')) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            await ctx.answerCallbackQuery();
            await renderBankObjectList(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
                direction,
            });
            return true;
        }
        if (callbackData.startsWith('bank_money:')) {
            const payload = callbackData.replace('bank_money:', '');
            const [placeIdRaw, buildingKey] = payload.split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            await ctx.answerCallbackQuery();
            await renderBankMoneyDirectionMenu(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
            });
            return true;
        }
        if (callbackData.startsWith('bank_money_dir:')) {
            const payload = callbackData.replace('bank_money_dir:', '');
            const [placeIdRaw, buildingKey, directionRaw] = payload.split('|');
            const placeId = Number(placeIdRaw);
            const direction = directionRaw;
            if (!Number.isFinite(placeId) || !buildingKey || (direction !== 'deposit' && direction !== 'withdraw')) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            await ctx.answerCallbackQuery();
            await startBankMoneyAmountPrompt(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
                direction,
            });
            return true;
        }
        if (callbackData === 'bank_money_confirm') {
            await ctx.answerCallbackQuery();
            await confirmBankMoneyTransfer(ctx);
            return true;
        }
        if (callbackData === 'bank_money_cancel') {
            await ctx.answerCallbackQuery('Operacion cancelada');
            await cancelBankMoneyTransfer(ctx, 'edit');
            return true;
        }
        return false;
    }
    async function handleMessage(ctx, text) {
        const tgId = ctx.from.id;
        const bankState = await getBankState(tgId);
        if (bankState) {
            const player = await getPlayerByTelegramId(String(tgId));
            if (!player) {
                await clearBankState(tgId);
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, bankState.placeId))) {
                await clearBankState(tgId);
                await ctx.reply('Saliste del banco. Vuelve a entrar para gestionar la boveda.');
                return true;
            }
            const trimmed = text.trim();
            const isCancel = /^\/cancel(ar)?$/i.test(trimmed);
            if (bankState.phase === 'object_listing') {
                if (isCancel) {
                    await handleBankHub(ctx, {
                        mode: 'reply',
                        placeId: bankState.placeId,
                        buildingKey: bankState.buildingKey,
                        infoLine: '❌ Operacion cancelada.',
                    });
                    return true;
                }
                const moveMatch = trimmed.match(/^\/bo_(\d+)(?:\s+(\d+))?(?:\.\.\.)?$/i);
                if (!moveMatch) {
                    if (!trimmed.startsWith('/')) {
                        await ctx.reply('Usa /bo_x o /bo_x N para mover unidades. /cancel para salir.');
                        return true;
                    }
                }
                else {
                    const listIndex = Number.parseInt(moveMatch[1], 10);
                    const qtyRaw = moveMatch[2];
                    const entry = bankState.entries.find((candidate) => candidate.listIndex === listIndex);
                    if (!entry) {
                        await ctx.reply(`No existe /bo_${listIndex} en la lista actual.`);
                        return true;
                    }
                    if (entry.kind === 'resource' && entry.quantity > 1 && !qtyRaw) {
                        await setBankState(tgId, {
                            phase: 'object_qty',
                            placeId: bankState.placeId,
                            buildingKey: bankState.buildingKey,
                            vaultProfile: bankState.vaultProfile,
                            direction: bankState.direction,
                            entries: bankState.entries,
                            entry,
                        });
                        await ctx.reply(`¿Cuántas unidades moverás de ${entry.emoji} ${entry.name}? (1-${entry.quantity})`);
                        return true;
                    }
                    const qty = qtyRaw ? Number.parseInt(qtyRaw, 10) : 1;
                    if (qty < 1 || !Number.isFinite(qty)) {
                        await ctx.reply('Cantidad invalida. Usa un numero mayor a 0.');
                        return true;
                    }
                    if (entry.kind === 'resource' && qty > entry.quantity) {
                        await ctx.reply(`No puedes mover ${qty}. Maximo disponible: ${entry.quantity}.`);
                        return true;
                    }
                    const result = await moveVaultObject(player.id, bankState.direction, entry.slotUid, qty, bankState.vaultProfile);
                    await renderBankObjectList(ctx, {
                        mode: 'reply',
                        placeId: bankState.placeId,
                        buildingKey: bankState.buildingKey,
                        direction: bankState.direction,
                        infoLine: result.success ? result.message : `⚠️ ${result.message}`,
                    });
                    return true;
                }
            }
            else if (bankState.phase === 'object_qty') {
                if (isCancel) {
                    await renderBankObjectList(ctx, {
                        mode: 'reply',
                        placeId: bankState.placeId,
                        buildingKey: bankState.buildingKey,
                        direction: bankState.direction,
                        infoLine: '❌ Operacion cancelada.',
                    });
                    return true;
                }
                if (trimmed.startsWith('/')) {
                    await ctx.reply(`Escribe una cantidad entre 1 y ${bankState.entry.quantity}, o /cancel.`);
                    return true;
                }
                const qty = Number.parseInt(trimmed, 10);
                if (!Number.isFinite(qty) || qty < 1 || qty > bankState.entry.quantity) {
                    await ctx.reply(`Cantidad invalida. Elige entre 1 y ${bankState.entry.quantity}.`);
                    return true;
                }
                const result = await moveVaultObject(player.id, bankState.direction, bankState.entry.slotUid, qty, bankState.vaultProfile);
                await renderBankObjectList(ctx, {
                    mode: 'reply',
                    placeId: bankState.placeId,
                    buildingKey: bankState.buildingKey,
                    direction: bankState.direction,
                    infoLine: result.success ? result.message : `⚠️ ${result.message}`,
                });
                return true;
            }
            else if (bankState.phase === 'money_amount') {
                if (isCancel) {
                    await renderBankMoneyDirectionMenu(ctx, {
                        mode: 'reply',
                        placeId: bankState.placeId,
                        buildingKey: bankState.buildingKey,
                        infoLine: '❌ Operacion cancelada.',
                    });
                    return true;
                }
                if (trimmed.startsWith('/')) {
                    await ctx.reply('Escribe monto y moneda. Ej: 50 s o 1 g. Usa /cancel para salir.');
                    return true;
                }
                const moneyInput = parseBankMoneyInput(trimmed);
                if (!moneyInput) {
                    await ctx.reply('Formato invalido. Ejemplos: 50 s, 1 g');
                    return true;
                }
                const feeSilver = bankState.direction === 'deposit' ? calculateDepositFeeSilver(moneyInput.currency, moneyInput.amount) : 0;
                await setBankState(tgId, {
                    phase: 'money_confirm',
                    placeId: bankState.placeId,
                    buildingKey: bankState.buildingKey,
                    direction: bankState.direction,
                    currency: moneyInput.currency,
                    amount: moneyInput.amount,
                    feeSilver,
                });
                const currencyLabel = moneyInput.currency === 'GOLD' ? 'oro' : 'plata';
                const actionLabel = bankState.direction === 'deposit' ? 'Depositar' : 'Retirar';
                const previewLines = [
                    `⚠️ Confirmar ${actionLabel}`,
                    '✧═══••═══✧',
                    `Monto: ${moneyInput.amount} ${currencyLabel}`,
                    `Fee: ${feeSilver} ${EMOJIS.ui.silver}`,
                    bankState.direction === 'deposit'
                        ? 'La tarifa se descontara de tu plata en mano.'
                        : 'Retiro sin comisiones.',
                ];
                await ctx.reply(previewLines.join('\n'), { reply_markup: buildBankMoneyConfirmKeyboard() });
                return true;
            }
            else if (bankState.phase === 'money_confirm') {
                if (isCancel) {
                    await cancelBankMoneyTransfer(ctx, 'reply');
                    return true;
                }
                await ctx.reply('Usa los botones para confirmar o cancelar, o escribe /cancel.');
                return true;
            }
        }
        if (/^\/bo_\d+(?:\.\.\.)?$/i.test(text.trim())) {
            await ctx.reply('No hay movimiento de boveda activo. Entra al banco y abre "Mover Objetos".');
            return true;
        }
        return false;
    }
    return {
        openHub: handleBankHub,
        handleCallback,
        handleMessage,
    };
}
