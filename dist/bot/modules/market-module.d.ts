import { openHub } from './market-module-content.js';
export declare function createMarketModule(): {
    openHub: typeof openHub;
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any, text: any) => Promise<boolean>;
};
