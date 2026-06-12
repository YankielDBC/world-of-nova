// @ts-nocheck
import { getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { EMOJIS } from '../../data/emojis.js';
import { calculateDepositFeeSilver, moveVaultObject } from '../../services/crown-bank.js';
import { isPlayerAtPlaceById, parseBankMoneyInput, buildBankMoneyConfirmKeyboard } from './bank-module-helpers.js';
import { getBankState, setBankState, clearBankState, openHub, renderBankObjectDirectionMenu, renderBankObjectList, renderBankMoneyDirectionMenu, startBankMoneyAmountPrompt, cancelBankMoneyTransfer, confirmBankMoneyTransfer } from './bank-module-content.js';

export function createBankModule() {
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
            await openHub(ctx, {
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
                    await openHub(ctx, {
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
        openHub,
        handleCallback,
        handleMessage,
    };
}
