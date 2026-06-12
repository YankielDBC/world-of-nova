// @ts-nocheck
import { getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { compactText } from '../../lib/ui-compact.js';
import { EMOJIS } from '../../data/emojis.js';
import { calculateDepositFeeSilver, depositToVaultWithFee, getVaultOverview, listVaultMoveEntries, moveVaultObject, withdrawFromVault } from '../../services/crown-bank.js';
import { clearConversationState, getConversationState, setConversationState } from '../../lib/conversation-state.js';
import { BANK_SCOPE, buildBankHubKeyboard, buildBankMoneyAmountKeyboard, buildBankMoneyConfirmKeyboard, buildBankMoneyDirectionKeyboard, buildBankObjectDirectionKeyboard, buildBankObjectListKeyboard, getPlayerLanguage, getVaultProfileByBuildingKey, isVillageChest, isPlayerAtPlaceById, parseBankMoneyInput, sendBankScreen } from './bank-module-helpers.js';

export async function getBankState(playerTgId) {
    return getConversationState(BANK_SCOPE, playerTgId);
}
export async function setBankState(playerTgId, state) {
    await setConversationState(BANK_SCOPE, playerTgId, state, 30 * 60);
}
export async function clearBankState(playerTgId) {
    await clearConversationState(BANK_SCOPE, playerTgId);
}
export async function loadBankContext(ctx, placeId) {
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
export async function openHub(ctx, params) {
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
export async function renderBankObjectDirectionMenu(ctx, params) {
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
export async function renderBankObjectList(ctx, params) {
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
export async function renderBankMoneyDirectionMenu(ctx, params) {
    const context = await loadBankContext(ctx, params.placeId);
    if (!context) {
        return;
    }
    const vaultProfile = getVaultProfileByBuildingKey(params.buildingKey);
    if (vaultProfile === 'village') {
        await openHub(ctx, {
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
export async function startBankMoneyAmountPrompt(ctx, params) {
    const context = await loadBankContext(ctx, params.placeId);
    if (!context) {
        return;
    }
    if (isVillageChest(params.buildingKey)) {
        await openHub(ctx, {
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
export async function cancelBankMoneyTransfer(ctx, mode) {
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
    await openHub(ctx, {
        mode,
        placeId: state.placeId,
        buildingKey: state.buildingKey,
        infoLine: '❌ Operacion cancelada.',
    });
}
export async function confirmBankMoneyTransfer(ctx) {
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
    await openHub(ctx, {
        mode: 'edit',
        placeId: state.placeId,
        buildingKey: state.buildingKey,
        infoLine: summaryLine,
    });
}
