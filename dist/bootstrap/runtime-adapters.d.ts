import type { LanguageLike, PlayerTgId } from '../types/runtime-contracts.js';
export declare function asStringPlayerTgIdGetter<T>(fn: (playerTgId: string) => Promise<T>): (playerTgId: PlayerTgId) => Promise<T>;
export declare function asStringPlayerTgIdSetter<TState>(fn: (playerTgId: string, state: TState) => Promise<void>): (playerTgId: PlayerTgId, state: TState) => Promise<void>;
export declare function asLanguageArg<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => TResult): (...args: unknown[]) => TResult;
export declare function asOptionalLanguageSecondArg<TFirst, TResult, TLang = LanguageLike>(fn: (first: TFirst, lang?: TLang) => TResult): (first: TFirst, lang?: string) => TResult;
export declare function asOptionalLanguageThirdArg<TFirst, TSecond, TResult, TLang = LanguageLike>(fn: (first: TFirst, second: TSecond, lang?: TLang) => TResult): (first: TFirst, second: TSecond, lang?: string) => TResult;
