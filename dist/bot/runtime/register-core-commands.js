import { registerBasicCommands } from './core-command-registrars/basic-command-registrar.js';
import { registerInventoryCommands } from './core-command-registrars/inventory-command-registrar.js';
import { registerWorldCommands } from './core-command-registrars/world-command-registrar.js';
const CORE_COMMAND_REGISTRARS = [
    registerBasicCommands,
    registerInventoryCommands,
    registerWorldCommands,
];
export function registerCoreCommands(bot, deps) {
    for (const registerCommands of CORE_COMMAND_REGISTRARS) {
        registerCommands(bot, deps);
    }
}
