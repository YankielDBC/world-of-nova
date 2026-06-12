export declare function triggerDevExplorer(force?: boolean): void;
export declare function getDevExplorerState(): {
    status: string;
    startedAt: any;
    processedTiles: number;
    totalTiles: number;
    report: any;
    error: any;
};
export declare function renderDevExplorerReport(lang?: string): string;
