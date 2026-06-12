type TelegramApi = {
    sendMessage: (chatId: string | number, text: string, other?: {
        parse_mode?: 'HTML';
        disable_web_page_preview?: boolean;
    }) => Promise<{
        message_id?: number;
    } | unknown>;
    editMessageText: (chatId: string | number, messageId: number, text: string, other?: {
        parse_mode?: 'HTML';
        disable_web_page_preview?: boolean;
    }) => Promise<unknown>;
};
export declare function publishCommunityPatchNotes(api: TelegramApi): Promise<{
    posted: number;
    edited: number;
    skipped: number;
    failed: number;
}>;
export {};
