export declare function checkAFKStatus(tgId: string): Promise<{
    isAFK: boolean;
    wasAway: boolean;
}>;
export declare function updateAFKTimer(tgId: string): Promise<void>;
