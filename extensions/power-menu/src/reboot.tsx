import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function Reboot() {
  await executePowerCommand(POWER_COMMANDS.REBOOT);
}
