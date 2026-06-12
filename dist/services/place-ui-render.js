import { InlineKeyboard } from 'grammy';
import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
import { getForgeServiceCost } from '../data/price-index.js';
import { t } from '../lib/i18n.js';
import { CUSTOM_PLACE_FREE_SERVICES } from './place-recovery.js';
import { EMOJIS } from '../data/emojis.js';
function t3(lang, es, en, ru) {
    if (lang === 'en') {
        return en;
    }
    if (lang === 'ru') {
        return ru;
    }
    return es;
}
function getCurrencyEmoji(costType) {
    if (costType === 'GOLD') {
        return EMOJIS.ui.gold;
    }
    return EMOJIS.ui.silver;
}
function getDisplayCost(slug, interaction) {
    if (slug.startsWith('crow-forge-')) {
        const amount = getForgeServiceCost(slug, interaction?.costAmount ?? 0);
        return { amount, costType: 'SILVER' };
    }
    return {
        amount: interaction?.costAmount ?? 0,
        costType: interaction?.costType ?? 'SILVER',
    };
}
function formatServiceLine(params) {
    const duration = params.durationLabel ? ` (${params.durationLabel})` : '';
    return `${params.marker} ${params.emoji} ${params.name}: ${params.costAmount} ${getCurrencyEmoji(params.costType)}${duration}`;
}
function buildRecoveryBuildingBody(buildingKey, lang) {
    if (buildingKey === 'gilded-rest' || buildingKey === 'village-rest') {
        return t3(lang, 'Calido motel donde los aventureros toman un descanso y recuperan STA. Puedes usar los servicios de pago o el gratuito, que tarda hasta 24h en recargarte de 0% a 100%. Mientras descansas no puedes hacer ninguna otra tarea, pero siempre podras interrumpir el descanso y conservar la STA recuperada.', 'Warm motel where adventurers rest and recover STA. You can use paid services or the free plan, which can take up to 24h to recover you from 0% to 100%. While resting you cannot do other tasks, but you can always interrupt and keep the STA recovered so far.', 'Tepliy motel, gde puteshestvenniki otdykhayut i vosstanavlivayut STA. Mozhno polzovatsya platnymi uslugami ili besplatnym planom, kotoryi mozhet zanyat do 24 chasov dlya polnogo vosstanovleniya. Poka ty otdykhaesh, drugie deystviya nedostupny, no otdyh mozhno prekratit bez poteri uzhe vosstanovlennoy STA.');
    }
    if (buildingKey === 'mercy-edge' || buildingKey === 'village-shrine') {
        return t3(lang, 'Pequeno templo donde los heridos recobran salud. Puedes usar los servicios de pago o el gratuito, que tarda hasta 24h en recargarte de 0% a 100%. Mientras descansas no puedes hacer ninguna otra tarea, pero siempre podras interrumpir la recuperacion y conservar la salud recuperada.', 'Small temple where the wounded recover HP. You can use paid services or the free plan, which can take up to 24h to recover you from 0% to 100%. While recovering you cannot do other tasks, but you can always interrupt and keep the HP recovered so far.', 'Nebolshoy hram, gde ranenye vosstanavlivayut HP. Mozhno polzovatsya platnymi uslugami ili besplatnym planom, kotoryi mozhet zanyat do 24 chasov dlya polnogo vosstanovleniya. Poka idet vosstanovlenie, drugie deystviya nedostupny, no ego mozhno prekratit bez poteri uzhe vosstanovlennogo HP.');
    }
    return null;
}
function buildCaveBuildingBody(buildingKey, lang) {
    if (buildingKey !== 'cave-mouth') {
        return null;
    }
    return t3(lang, 'La roca se abre ante ti. Dentro te espera un mapa propio de la cueva, con paredes cerradas y rutas por descubrir. Tu progreso dentro quedara guardado.', 'The rock opens before you. Inside awaits a dedicated cave map with sealed walls and routes to uncover. Your progress inside will be saved.', 'Skala raskryvaetsya pered тобoi. Vnutri tebya zhdet otdelnaya karta peschery so stenami i skrytymi marshrutami. Progress vnutri budet sokhranen.');
}
export function formatPlaceOverview(place, lang, populationLine) {
    const config = getPlaceUiConfig(place.slug);
    if (!config) {
        const message = `${place.emoji} ${place.displayName}\n` +
            `✧═══••═══✧\n` +
            `${t(lang, 'inspectPlaceHint')}`;
        const keyboard = new InlineKeyboard().row().text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
        return { message, keyboard };
    }
    const placeName = getLocalizedText(config.name, lang, place.displayName);
    const hint = getLocalizedText(config.hint, lang, '');
    const rulesLabel = getLocalizedText(config.rulesLabel, lang, '');
    const buildingsLabel = getLocalizedText(config.buildingsLabel, lang, '');
    const lines = [];
    lines.push(`${place.emoji} ${placeName}`);
    lines.push('✧═══••═══✧');
    if (hint) {
        lines.push(`💡: ${hint}`);
        lines.push('');
    }
    lines.push(`🔹${rulesLabel || 'Reglas'}`);
    const pvpStatus = place.pvpAllowed ? '🟢' : '🚫';
    const combatStatus = place.combatAllowed ? '🟢' : '🚫';
    lines.push(`┌${EMOJIS.ui.shield} ${getLocalizedText(config.rules.pvpOff, lang, 'PvP')} ${pvpStatus}`);
    lines.push(`└${EMOJIS.ui.crossedSwords} ${getLocalizedText(config.rules.creaturesOff, lang, 'Criaturas')} ${combatStatus}`);
    if (populationLine) {
        lines.push(populationLine);
    }
    lines.push('');
    lines.push(`🔹${buildingsLabel || 'Edificios'}`);
    lines.push('┌────────┐');
    const interactionSlugs = new Set(place.interactions.map((interaction) => interaction.slug));
    const keyboard = new InlineKeyboard();
    config.buildings.forEach((building, index) => {
        const buildingName = getLocalizedText(building.name, lang, building.name.es);
        const buildingButtonLabel = building.typeLabel
            ? getLocalizedText(building.typeLabel, lang, buildingName)
            : buildingName;
        const hasActive = building.services.some((service) => interactionSlugs.has(service.slug));
        const statusDot = hasActive ? '🟢' : '⚪';
        const marker = index === config.buildings.length - 1 ? '└' : '├';
        lines.push(`${marker} ${building.emoji} ${buildingName} ${statusDot}`);
        keyboard.text(`${building.emoji} ${buildingButtonLabel}`, `place_building:${place.id}|${building.key}`);
        if ((index + 1) % 3 === 0 && index < config.buildings.length - 1) {
            keyboard.row();
        }
    });
    if (config.buildings.length % 3 === 0) {
        keyboard.row();
    }
    keyboard.text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
    return { message: lines.join('\n'), keyboard };
}
function getTrainingSkillKeyBySlug(slug) {
    if (slug === 'training-yard-lesson-chop')
        return 'chop';
    if (slug === 'training-yard-lesson-gather')
        return 'gather';
    if (slug === 'training-yard-lesson-mine')
        return 'mine';
    if (slug === 'training-yard-lesson-fishing')
        return 'fish';
    return null;
}
function getTrainingSkillLabel(lang, key) {
    if (key === 'chop')
        return t(lang, 'skillNameChop');
    if (key === 'mine')
        return t(lang, 'skillNameMine');
    if (key === 'fish')
        return t(lang, 'skillNameFish');
    return t(lang, 'skillNameGather');
}
export function formatPlaceBuilding(place, building, lang, populationLine, options) {
    const interactionBySlug = new Map(place.interactions.map((interaction) => [interaction.slug, interaction]));
    const learnedSkillKeys = options?.learnedSkillKeys ?? new Set();
    const buildingName = getLocalizedText(building.name, lang, building.name.es);
    const description = getLocalizedText(building.description, lang, '');
    const hint = getLocalizedText(building.hint, lang, '');
    const lines = [];
    lines.push(`${building.emoji} ${buildingName}`);
    lines.push('✧═══••═══✧');
    const specialRecoveryBody = buildRecoveryBuildingBody(building.key, lang);
    const specialCaveBody = buildCaveBuildingBody(building.key, lang);
    if (specialRecoveryBody) {
        lines.push(specialRecoveryBody);
        lines.push('');
    }
    else if (specialCaveBody) {
        lines.push(specialCaveBody);
        lines.push('');
    }
    else {
        if (description) {
            lines.push(description);
            lines.push('');
        }
        if (hint) {
            lines.push(`💡: ${hint}`);
            lines.push('');
        }
    }
    if (building.key === 'crown-chamber') {
        lines.push(`📄${t3(lang, 'Gestion de boveda', 'Vault management', 'Upravlenie khranilishchem')}`);
        lines.push('┌────────┐');
        lines.push(`└ 📦 ${t3(lang, 'Administrar Boveda', 'Manage Vault', 'Upravlyat khranilishchem')}`);
        if (populationLine) {
            lines.push('');
            lines.push(populationLine);
        }
        const keyboard = new InlineKeyboard()
            .text(t3(lang, '📦 Administrar Boveda', '📦 Manage Vault', '📦 Upravlyat khranilishchem'), `bank_manage:${place.id}|${building.key}`)
            .row()
            .text(`↩ ${t(lang, 'placeBack')}`, 'place_back')
            .text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
        return { message: lines.join('\n'), keyboard };
    }
    if (building.key === 'village-chest') {
        lines.push(`📄${t3(lang, 'Gestión del baúl', 'Chest management', 'Upravlenie sundukom')}`);
        lines.push('┌────────┐');
        lines.push(`└ 📦 ${t3(lang, 'Administrar Baúl', 'Manage Chest', 'Upravlyat sundukom')}`);
        if (populationLine) {
            lines.push('');
            lines.push(populationLine);
        }
        const keyboard = new InlineKeyboard()
            .text(t3(lang, '📦 Administrar Baúl', '📦 Manage Chest', '📦 Upravlyat sundukom'), `bank_manage:${place.id}|${building.key}`)
            .row()
            .text(`↩ ${t(lang, 'placeBack')}`, 'place_back')
            .text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
        return { message: lines.join('\n'), keyboard };
    }
    if (building.key === 'grand-exchange') {
        lines.push(`📄${t3(lang, 'Mercado de Jugadores', 'Player Market', 'Rynok igrokov')}`);
        lines.push('┌────────┐');
        lines.push(`└ ${EMOJIS.ui.level} ${t3(lang, 'Abrir Centro de Comercio', 'Open Trade Hub', 'Otkryt torgovyy centr')}`);
        if (populationLine) {
            lines.push('');
            lines.push(populationLine);
        }
        const keyboard = new InlineKeyboard()
            .text(t3(lang, `${EMOJIS.ui.level} Abrir Mercado`, `${EMOJIS.ui.level} Open Market`, `${EMOJIS.ui.level} Otkryt rynok`), `market_hub:${place.id}|${building.key}`)
            .row()
            .text(`↩ ${t(lang, 'placeBack')}`, 'place_back')
            .text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
        return { message: lines.join('\n'), keyboard };
    }
    lines.push(`📄${t(lang, 'placeServicesTitle')}`);
    lines.push('┌────────┐');
    const keyboard = new InlineKeyboard();
    let activeButtons = 0;
    const visibleServices = building.key === 'crow-forge'
        ? building.services.filter((service) => !service.slug.startsWith('crow-forge-buy-'))
        : building.services;
    visibleServices.forEach((service, index) => {
        const interaction = interactionBySlug.get(service.slug);
        const marker = index === visibleServices.length - 1 ? '└' : '├';
        const rawServiceName = getLocalizedText(service.name, lang, service.name.es);
        const durationLabel = service.slug === 'cave-expedition'
            ? t3(lang, 'Inmediato', 'Instant', 'Momentalno')
            : getLocalizedText(service.duration, lang, '');
        const isCustomFree = CUSTOM_PLACE_FREE_SERVICES.has(service.slug);
        const trainingSkillKey = building.key === 'training-yard' ? getTrainingSkillKeyBySlug(service.slug) : null;
        const serviceName = trainingSkillKey
            ? getTrainingSkillLabel(lang, trainingSkillKey)
            : service.slug === 'cave-expedition'
                ? t3(lang, 'Entrar', 'Enter', 'Voyti')
                : rawServiceName;
        const isLearnedTrainingSkill = !!trainingSkillKey && learnedSkillKeys.has(trainingSkillKey);
        if (!interaction) {
            if (isCustomFree) {
                const displayCost = getDisplayCost(service.slug, null);
                lines.push(formatServiceLine({
                    marker,
                    emoji: service.emoji,
                    name: serviceName,
                    costAmount: displayCost.amount,
                    costType: displayCost.costType,
                    durationLabel,
                }));
                keyboard.text(`${service.emoji} ${serviceName}`, `place_custom:${place.id}|${building.key}|${service.slug}`);
                activeButtons += 1;
                if (activeButtons % 2 === 0) {
                    keyboard.row();
                }
            }
            else {
                lines.push(`${marker} ${service.emoji} ${serviceName} 🚫`);
            }
            return;
        }
        if (isLearnedTrainingSkill) {
            lines.push(`${marker} ${service.emoji} ${serviceName} (✅ Learned)`);
            return;
        }
        const displayCost = getDisplayCost(service.slug, interaction);
        lines.push(formatServiceLine({
            marker,
            emoji: service.emoji,
            name: serviceName,
            costAmount: displayCost.amount,
            costType: displayCost.costType,
            durationLabel,
        }));
        keyboard.text(`${service.emoji} ${serviceName}`, `place_interact_${interaction.id}`);
        activeButtons += 1;
        if (activeButtons % 2 === 0) {
            keyboard.row();
        }
    });
    if (building.key === 'crow-forge') {
        lines.push('');
        lines.push(t3(lang, '🛒 Tienda del Cuervo: compra herramientas o vende botin.', '🛒 Crow Shop: buy tools or sell loot.', '🛒 Lavka Vorona: pokupka instrumentov i prodazha dobychi.'));
        keyboard.row().text(t3(lang, '🛒 Tienda', '🛒 Shop', '🛒 Lavka'), `forge_shop:${place.id}|${building.key}`);
    }
    if (populationLine) {
        lines.push('');
        lines.push(populationLine);
    }
    keyboard.row().text(`↩ ${t(lang, 'placeBack')}`, 'place_back').text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
    return { message: lines.join('\n'), keyboard };
}
