// @ts-nocheck
import { prisma } from '../lib/db.js';
import { compactLabel } from '../lib/ui-compact.js';
import { TOOLS } from '../types/tools.js';
export async function getToolsCard(playerId) {
    const [equipment, playerTools] = await Promise.all([
        prisma.playerEquipment.findUnique({
            where: { playerId },
        }),
        prisma.playerTool.findMany({
            where: { playerId },
            orderBy: { id: 'asc' },
        }),
    ]);
    const equippedIds = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
    const lines = ['🔧 Herramientas', '✧═══••═══✧'];
    if (playerTools.length === 0) {
        lines.push('No tienes herramientas.');
        return lines.join('\n');
    }
    for (const tool of playerTools) {
        const meta = TOOLS[tool.toolKey];
        if (!meta) {
            continue;
        }
        const marker = equippedIds.has(tool.id) ? '🟢' : '⚪';
        lines.push(`#${tool.id} ${marker} ${meta.emoji} ${compactLabel(meta.name, 16)} ${tool.durability}/${tool.maxDurability}`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=tools.js.map