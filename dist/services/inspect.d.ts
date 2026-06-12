import type { InspectActionResult, InspectActionType, InspectNodeView, InspectRenderResult } from './inspect-types.js';
export type { InspectActionResult, InspectActionType, InspectNodeView, InspectRenderResult, } from './inspect-types.js';
export declare function renderInspectForPlayer(playerTgId: string): Promise<InspectRenderResult | null>;
export declare function getInspectNodesForPlayer(playerTgId: string): Promise<{
    tileId: number;
    nodes: InspectNodeView[];
} | null>;
export declare function executeInspectAction(params: {
    playerTgId: string;
    action: InspectActionType;
    listIndex: number;
    quantity: number;
}): Promise<InspectActionResult>;
