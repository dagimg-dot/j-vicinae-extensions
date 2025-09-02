import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function PowerOff() {
  await executePowerCommand(POWER_COMMANDS.POWEROFF);
}
