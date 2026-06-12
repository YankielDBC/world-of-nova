export interface LowVitalsAlertResult {
    text: string;
}
export declare function consumeLowVitalsAlertByTgId(tgId: string): Promise<LowVitalsAlertResult | null>;
