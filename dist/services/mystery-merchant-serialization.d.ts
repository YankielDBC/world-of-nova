import type { MerchantOffer, MerchantRowSnapshotSource, MerchantSnapshot } from './mystery-merchant-types.js';
export declare function parseOffers(raw: string): MerchantOffer[];
export declare function serializeOffers(offers: MerchantOffer[]): string;
export declare function toSnapshot(row: MerchantRowSnapshotSource): MerchantSnapshot;
