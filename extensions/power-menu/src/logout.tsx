import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function Logout() {
  await executePowerCommand(POWER_COMMANDS.LOGOUT);
}
