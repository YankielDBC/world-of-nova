import { type ClimateKind } from './climate.js';
import { type DayCycleSnapshot } from './day-cycle.js';
import { type ZoneBand } from './world-zones.js';
interface ResourceTally {
    emoji: string;
    name: string;
    quantity: number;
    estSilver: number;
}
interface DevExplorerReport {
    generatedAt: number;
    startedAt: number;
    endedAt: number;
    elapsedMs: number;
    totalTiles: number;
    area: {
        width: number;
        height: number;
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    dayPeriod: DayCycleSnapshot['period'];
    movement: {
        steps: number;
        staCost: number;
    };
    harvesting: {
        staCost: number;
        totalResourceUnits: number;
        totalResourceKinds: number;
        estimatedMarketSilver: number;
    };
    combinedStaCost: number;
    biomeCounts: Record<string, number>;
    zoneBandCounts: Record<ZoneBand['id'], number>;
    climateCounts: Record<string, number>;
    climateKindCounts: Record<ClimateKind, number>;
    climateEventCounts: Record<string, number>;
    topResources: ResourceTally[];
    placeCounts: {
        fixed: number;
        dynamic: number;
        villages: number;
        caves: number;
        ruins: number;
    };
}
interface ExplorerState {
    status: 'idle' | 'running' | 'ready' | 'error';
    startedAt: number | null;
    processedTiles: number;
    totalTiles: number;
    report: DevExplorerReport | null;
    error: string | null;
}
export declare function triggerDevExplorer(force?: boolean): void;
export declare function getDevExplorerState(): ExplorerState;
export declare function renderDevExplorerReport(lang?: 'es' | 'en' | 'ru'): string;
export {};
