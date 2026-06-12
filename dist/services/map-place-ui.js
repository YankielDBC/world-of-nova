import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
export function getPlaceBuildingEntries(place, lang) {
    const config = getPlaceUiConfig(place.slug ?? null);
    if (config) {
        const interactionSlugs = new Set(place.interactions.map((interaction) => interaction.slug));
        const activeBuildings = config.buildings.filter((building) => building.services.some((service) => interactionSlugs.has(service.slug)));
        const buildingsToRender = activeBuildings.length > 0 ? activeBuildings : config.buildings;
        return buildingsToRender.map((building, index) => {
            const marker = index === buildingsToRender.length - 1 ? '└' : '├';
            const buildingName = getLocalizedText(building.name, lang, building.name.es);
            return `${marker} ${building.emoji} ${buildingName}`;
        });
    }
    const seen = new Set();
    const buildings = [];
    for (const interaction of place.interactions) {
        const buildingKey = interaction.slug.split('-').slice(0, 2).join('-').trim().toLowerCase();
        if (seen.has(buildingKey))
            continue;
        seen.add(buildingKey);
        buildings.push(`${interaction.emoji} ${interaction.displayName}`);
    }
    return buildings.map((building, index) => {
        const marker = index === buildings.length - 1 ? '└' : '├';
        return `${marker} ${building}`;
    });
}
export const getPlaceBuildingEntriesClean = getPlaceBuildingEntries;
