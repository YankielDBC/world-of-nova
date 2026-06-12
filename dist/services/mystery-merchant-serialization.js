export function parseOffers(raw) {
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        const sanitized = [];
        for (const entry of parsed) {
            if (!entry || typeof entry !== 'object')
                continue;
            const kind = entry.kind === 'tool' ? 'tool' : entry.kind === 'resource' ? 'resource' : null;
            if (!kind)
                continue;
            const stock = Number(entry.stock);
            const maxStock = Number(entry.maxStock);
            const priceSilver = Number(entry.priceSilver);
            const id = String(entry.id || '').trim();
            const emoji = String(entry.emoji || '').trim();
            const name = String(entry.name || '').trim();
            if (!id || !emoji || !name)
                continue;
            if (!Number.isFinite(stock) || stock < 0)
                continue;
            if (!Number.isFinite(maxStock) || maxStock < 1)
                continue;
            if (!Number.isFinite(priceSilver) || priceSilver < 1)
                continue;
            const offer = {
                id,
                kind,
                emoji,
                name,
                stock: Math.max(0, Math.floor(stock)),
                maxStock: Math.max(1, Math.floor(maxStock)),
                priceSilver: Math.max(1, Math.floor(priceSilver)),
            };
            if (kind === 'resource') {
                const resourceId = Number(entry.resourceId);
                if (!Number.isFinite(resourceId))
                    continue;
                offer.resourceId = Math.floor(resourceId);
            }
            else {
                const toolKey = String(entry.toolKey || '').trim();
                if (!toolKey)
                    continue;
                offer.toolKey = toolKey;
            }
            sanitized.push(offer);
        }
        return sanitized;
    }
    catch {
        return [];
    }
}
export function serializeOffers(offers) {
    return JSON.stringify(offers);
}
export function toSnapshot(row) {
    return {
        id: row.id,
        worldMapId: row.worldMapId,
        mapX: row.mapX,
        mapY: row.mapY,
        prevX: row.prevX,
        prevY: row.prevY,
        arrivedAt: row.arrivedAt,
        departsAt: row.departsAt,
        stayToken: row.stayToken,
        buybackMultiplier: row.buybackMultiplier,
        rumorSentAt: row.rumorSentAt,
        confirmedAt: row.confirmedAt,
        offers: parseOffers(row.offersJson),
    };
}
