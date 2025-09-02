import { spawn } from "node:child_process";
import {
  type EnvironmentVariables,
  getFallbackEnvironment,
  getGnomeEnvironment,
} from "./environment";
import { getSystemInfo } from "./system-info";

/**
 * Launches a GNOME Control Center panel
 */
export async function launchGnomePanel(panelName: string): Promise<void> {
  const systemInfo = getSystemInfo();

  try {
    // Try to get environment from running GNOME processes
    const gnomeEnv = getGnomeEnvironment(systemInfo);
    const env = createLaunchEnvironment(gnomeEnv, systemInfo);
    spawnGnomeControlCenter(panelName, env);
  } catch {
    // Fallback: use hardcoded environment values
    const fallbackEnv = getFallbackEnvironment(systemInfo);
    spawnGnomeControlCenter(panelName, fallbackEnv);
  }
}

/**
 * Creates the environment for launching GNOME Control Center
 */
function createLaunchEnvironment(
  gnomeEnv: EnvironmentVariables,
  systemInfo: { userHome: string; currentUser: string }
): EnvironmentVariables {
  return {
    ...gnomeEnv,
    HOME: systemInfo.userHome,
    USER: systemInfo.currentUser,
    PATH: process.env.PATH || "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  };
}

/**
 * Spawns the GNOME Control Center process
 */
function spawnGnomeControlCenter(panelName: string, env: EnvironmentVariables): void {
  const child = spawn("gnome-control-center", [panelName], {
    detached: true,
    stdio: "ignore",
    env,
  });

  child.unref();
}
