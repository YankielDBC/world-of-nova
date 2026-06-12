import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { findNearestDiscoveredTile } from './mystery-merchant-pathing.js';
import { formatEtaFromDistance as formatEtaFromDistanceBase, pickRandomText as pickRandomTextBase, randomInt, } from './mystery-merchant-utils.js';
function formatEtaFromDistance(distance) {
    return formatEtaFromDistanceBase(distance, RUNTIME_CONFIG.merchantEtaSecondsPerTile);
}
export function pickRandomText(options) {
    return pickRandomTextBase(options);
}
export function decorateMerchantAlertText(text) {
    const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (lines.length === 0) {
        return text;
    }
    const title = lines[0].replace(/^[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]+/, '').trim() || 'Alerta del Reino';
    const emojis = ['🏃', '💰', '🧭', '✨'];
    const body = lines.slice(1).map((line, index) => {
        let formatted = line.replace(/Comerciante Misterioso/gi, '<b>Comerciante Misterioso</b>');
        if (index === 0 || index === lines.length - 2) {
            formatted = `<i>${formatted}</i>`;
        }
        return `${emojis[index % emojis.length]} ${formatted}`;
    });
    return [`🗣️ <b>${title}</b> 👌`, '', ...body].join('\n');
}
export async function sendStyledChannelAlert(api, chatId, text) {
    try {
        await api.sendMessage(chatId, text, { parse_mode: 'HTML' });
    }
    catch {
        await api.sendMessage(chatId, text);
    }
}
export async function sendRumorHint(api, snapshot) {
    if (RUNTIME_CONFIG.communityProgressOnly) {
        return true;
    }
    if (!RUNTIME_CONFIG.merchantAlertsChannel) {
        return false;
    }
    const nearby = await findNearestDiscoveredTile({
        worldMapId: snapshot.worldMapId,
        x: snapshot.mapX,
        y: snapshot.mapY,
        radius: RUNTIME_CONFIG.merchantRumorRadius,
    });
    const text = nearby
        ? [
            '🔔 Susurro del Reino',
            `Alguien vio a un hombre intrigante a lo lejos, cerca de (${nearby.x}, ${nearby.y}).`,
            `Podria estar a unos ${formatEtaFromDistance(nearby.distance)}.`,
            'Dicen que el Comerciante Misterioso trae rarezas y paga precios absurdamente buenos.',
        ].join('\n')
        : [
            '🔔 Susurro del Reino',
            'Corren rumores de un comerciante encapuchado en las fronteras.',
            'Nadie confirma coordenadas, pero paga muy por encima del mercado.',
            'Mantente alerta: podria aparecer en cualquier ruta.',
        ].join('\n');
    const finalText = (nearby
        ? pickRandomText([
            [
                '🔔 ╔══════════════════╗',
                '🕯️ RUMOR DEL REINO',
                '╚══════════════════╝',
                `👤 Vieron una silueta sospechosa cerca de (${nearby.x}, ${nearby.y}).`,
                `⏱️ Podria estar a ${formatEtaFromDistance(nearby.distance)}.`,
                '💰 Dicen que el Comerciante Misterioso paga muy por encima del mercado.',
            ].join('\n'),
            [
                '📯 Eco en los caminos',
                `Sombras y campanas: reportan al Comerciante Misterioso rondando (${nearby.x}, ${nearby.y}).`,
                `⌛ Distancia estimada: ${formatEtaFromDistance(nearby.distance)}.`,
                '✨ Si el rumor es real, hoy puede haber tratos raros.',
            ].join('\n'),
            [
                '🕵️ Aviso de exploradores',
                `Se detecto actividad inusual alrededor de (${nearby.x}, ${nearby.y}).`,
                `🧭 Tiempo de llegada aproximado: ${formatEtaFromDistance(nearby.distance)}.`,
                '🪙 El encapuchado compra caro y vende piezas dificiles de ver.',
            ].join('\n'),
        ])
        : pickRandomText([
            [
                '🔔 Rumor sin coordenadas',
                'Un comerciante encapuchado estaria cruzando rutas lejanas.',
                '🧭 No hay posicion exacta, solo huellas borrosas.',
                '💰 Si aparece, prepara botin: compra por encima del mercado.',
            ].join('\n'),
            [
                '🌫️ Mensaje del viento',
                'Mercaderes y exploradores hablan de una sombra con mochila pesada.',
                '📜 No hay prueba firme, pero sus precios rompen la rutina.',
                '🕯️ Si el rumor prende, media frontera saldra a buscarlo.',
            ].join('\n'),
            [
                '🪙 Voces del camino',
                'Un comerciante misterioso habria sido visto entre rutas sin nombre.',
                '👀 Nadie da coordenadas claras.',
                '⚠️ Solo una promesa: oro rapido para quien llegue primero.',
            ].join('\n'),
        ])) || text;
    await sendStyledChannelAlert(api, RUNTIME_CONFIG.merchantAlertsChannel, decorateMerchantAlertText(finalText));
    return true;
}
export function getMerchantIntroText(lang, buybackMultiplier) {
    const esOptions = [
        `Sus ojos brillan bajo la capucha. "Pocas preguntas, buenos precios... compro a x${buybackMultiplier}."`,
        `"Llegas justo a tiempo", murmura. "Mi caravana no espera. Hoy pago x${buybackMultiplier} por botin util."`,
        `"Monedas por secretos", dice con media sonrisa. "Si traes algo valioso, te lo pago x${buybackMultiplier}."`,
    ];
    const enOptions = [
        `His eyes glow beneath the hood. "Few questions, fair trade... I buy at x${buybackMultiplier}."`,
        `"You arrived in time," he whispers. "My caravan won't wait. Today I pay x${buybackMultiplier} for useful loot."`,
        `"Coins for secrets," he smiles. "Bring me value and I pay x${buybackMultiplier}."`,
    ];
    const ruOptions = [
        `"Malo voprosov, mnogo monet... pokupayu x${buybackMultiplier}," shchetit neznakomets.`,
        `"Ty uspel vovremya," shepchit on. "Segodnya beru dobychu po x${buybackMultiplier}."`,
        `"Monety za redkosti," ulybaetsya torgovec. "Prinesi chto-to tsennoe i poluchish x${buybackMultiplier}."`,
    ];
    const options = lang === 'en' ? enOptions : lang === 'ru' ? ruOptions : esOptions;
    return options[randomInt(0, options.length - 1)];
}
