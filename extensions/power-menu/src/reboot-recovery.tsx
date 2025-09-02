import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function RebootRecovery() {
  await executePowerCommand(POWER_COMMANDS.REBOOT_RECOVERY);
}
