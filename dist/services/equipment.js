import { prisma } from '../lib/db.js';
import { collectEquipmentModifiers } from './equipment-runtime.js';
const equippedItemInclude = {
    include: {
        template: true,
    },
};
export function getEquipmentAggregate(items) {
    return collectEquipmentModifiers(items);
}
export function getEquipmentCombatModifiers(items) {
    return collectEquipmentModifiers(items).combat;
}
export function getEquipmentUtilityModifiers(items) {
    return collectEquipmentModifiers(items).utility;
}
export function getEquipmentGearScore(items) {
    return collectEquipmentModifiers(items).gearScore;
}
export async function getEquippedEquipmentInstances(playerId) {
    const equipment = await prisma.playerEquipment.findUnique({
        where: { playerId },
        include: {
            fishingTool: equippedItemInclude,
            head: equippedItemInclude,
            chest: equippedItemInclude,
            legs: equippedItemInclude,
            boots: equippedItemInclude,
            gloves: equippedItemInclude,
            belt: equippedItemInclude,
            cloak: equippedItemInclude,
            ring1: equippedItemInclude,
            ring2: equippedItemInclude,
            amulet: equippedItemInclude,
            mainHand: equippedItemInclude,
            offHand: equippedItemInclude,
            twoHand: equippedItemInclude,
        },
    });
    if (!equipment)
        return [];
    return [
        equipment.fishingTool,
        equipment.head,
        equipment.chest,
        equipment.legs,
        equipment.boots,
        equipment.gloves,
        equipment.belt,
        equipment.cloak,
        equipment.ring1,
        equipment.ring2,
        equipment.amulet,
        equipment.mainHand,
        equipment.offHand,
        equipment.twoHand,
    ].filter((item) => !!item);
}
export async function getPlayerEquipmentAggregate(playerId) {
    const items = await getEquippedEquipmentInstances(playerId);
    return collectEquipmentModifiers(items);
}
export async function getPlayerEquipmentCombatModifiers(playerId) {
    return (await getPlayerEquipmentAggregate(playerId)).combat;
}
export async function getPlayerEquipmentUtilityModifiers(playerId) {
    return (await getPlayerEquipmentAggregate(playerId)).utility;
}
export async function getPlayerEquipmentGearScore(playerId) {
    return (await getPlayerEquipmentAggregate(playerId)).gearScore;
}
