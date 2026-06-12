export declare const TELEGRAM_PHONE_LINE_LIMIT = 30;
export declare function compactText(value: string, maxChars: number, suffix?: string): string;
export declare function abbreviateName(value: string): string;
export declare function compactLabel(value: string, maxChars: number): string;
export declare function compactCoordLabel(x: number, y: number): string;
export declare function clampLine(line: string, _maxChars?: number): string;
export declare function fitCardLines(lines: string[], _maxChars?: number): string;
