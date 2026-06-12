export interface CommunityPatchNote {
    slug: string;
    version: string;
    title: string;
    summary: string;
    bullets: string[];
    closing?: string;
    uiPreview?: string[];
    flowSteps?: string[];
    gameplayImpact?: string[];
}
export declare const COMMUNITY_PATCH_NOTES: CommunityPatchNote[];
