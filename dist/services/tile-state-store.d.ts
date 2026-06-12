import { type TileResourceState } from '../lib/tile-state.js';
export interface TileStateMutationResult<T> {
    ok: boolean;
    result: T | null;
    attempts: number;
}
type TileStateMutatorResult<T> = {
    nextState: TileResourceState;
    result: T;
};
export declare function mutateTileResourceState<T>(tileId: number, mutator: (state: TileResourceState) => TileStateMutatorResult<T> | Promise<TileStateMutatorResult<T>>, maxRetries?: number): Promise<TileStateMutationResult<T>>;
export {};
