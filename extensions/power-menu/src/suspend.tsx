import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function Suspend() {
  await executePowerCommand(POWER_COMMANDS.SUSPEND);
}
