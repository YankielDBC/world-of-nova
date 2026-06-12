import { openHub } from './bank-module-content.js';
export declare function createBankModule(): {
    openHub: typeof openHub;
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any, text: any) => Promise<boolean>;
};
