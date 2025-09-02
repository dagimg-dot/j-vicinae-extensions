import { executePowerCommand, POWER_COMMANDS } from "./core/power-commands";

export default async function Hibernate() {
  await executePowerCommand(POWER_COMMANDS.HIBERNATE);
}
