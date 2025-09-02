import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function LockScreen() {
  await executePowerCommand(POWER_COMMANDS.LOCK_SCREEN);
}
