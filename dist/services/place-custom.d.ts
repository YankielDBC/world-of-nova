export declare function executeCustomPlaceInteraction(params: any): Promise<{
    handled: boolean;
    success: boolean;
    errorMessage: any;
    effectMessage?: undefined;
    extraLines?: undefined;
    currencyLine?: undefined;
} | {
    handled: boolean;
    success: boolean;
    effectMessage: any;
    extraLines: string[];
    currencyLine: string;
    errorMessage?: undefined;
} | {
    handled: boolean;
    success: boolean;
    effectMessage: any;
    extraLines: any[];
    errorMessage?: undefined;
    currencyLine?: undefined;
} | {
    handled: boolean;
    success?: undefined;
    errorMessage?: undefined;
    effectMessage?: undefined;
    extraLines?: undefined;
    currencyLine?: undefined;
}>;
