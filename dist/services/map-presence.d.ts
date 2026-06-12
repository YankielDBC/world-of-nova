export declare function checkAFKStatus(tgId: any): Promise<{
    isAFK: boolean;
    wasAway: boolean;
}>;
export declare function updateAFKTimer(tgId: any): Promise<void>;
