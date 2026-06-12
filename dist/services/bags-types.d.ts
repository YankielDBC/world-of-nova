export declare const ACTIVE_STATUS = "ACTIVE";
export declare const STORED_STATUS = "STORED";
export declare const DORMANT_STATUS = "DORMANT";
export declare const POCKETS_SLUG = "pockets";
export declare const bagInclude: {
    definition: boolean;
    slots: {
        orderBy: {
            slotIndex: string;
        };
        include: {
            resource: boolean;
            playerTool: boolean;
            equipmentInstance: {
                include: {
                    template: boolean;
                };
            };
            storedBag: {
                include: {
                    definition: boolean;
                };
            };
        };
    };
};
