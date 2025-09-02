import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function RebootUEFI() {
  await executePowerCommand(POWER_COMMANDS.REBOOT_UEFI);
}
