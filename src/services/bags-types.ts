// @ts-nocheck
export const ACTIVE_STATUS = 'ACTIVE';
export const STORED_STATUS = 'STORED';
export const DORMANT_STATUS = 'DORMANT';
export const POCKETS_SLUG = 'pockets';
export const bagInclude = {
    definition: true,
    slots: {
        orderBy: { slotIndex: 'asc' },
        include: {
            resource: true,
            playerTool: true,
            equipmentInstance: {
                include: {
                    template: true,
                },
            },
            storedBag: {
                include: {
                    definition: true,
                },
            },
        },
    },
};
