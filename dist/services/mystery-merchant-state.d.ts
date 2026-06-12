import { parseOffers, serializeOffers, toSnapshot } from './mystery-merchant-serialization.js';
import type { DbClient, MerchantOffer, MerchantSnapshot } from './mystery-merchant-types.js';
export declare function clearMerchantSnapshotCache(): void;
export declare function updateMerchantSnapshotCache(snapshot: MerchantSnapshot): void;
export declare function getMerchantSnapshotsForRead(tx?: DbClient): Promise<MerchantSnapshot[]>;
export declare function getMerchantCount(): number;
export declare function getManagedMerchantIds(): number[];
export declare function getForcedMerchantCoords(): {
    x: number;
    y: number;
} | null;
export declare function getWorldMapId(tx?: DbClient): Promise<number | null>;
export declare function generateMerchantOffers(tx?: DbClient): Promise<MerchantOffer[]>;
export declare function getRandomStaySeconds(): number;
export declare function ensureMerchantState(merchantId: number, tx?: DbClient): Promise<MerchantSnapshot | null>;
export declare function ensureMerchantStates(tx?: DbClient): Promise<MerchantSnapshot[]>;
export { parseOffers, serializeOffers, toSnapshot };
