import { execSync } from "node:child_process";
import type { SystemInfo } from "./system-info";

export type EnvironmentVariables = Record<string, string>;

/**
 * Gets environment variables from running GNOME processes
 */
export function getGnomeEnvironment(systemInfo: SystemInfo): EnvironmentVariables {
  const envVars: EnvironmentVariables = {};

  // Try different processes to get environment variables
  const processes = ["gnome-session", "gnome-shell"];

  for (const processName of processes) {
    try {
      const userEnv = execSync(
        `cat /proc/$(pgrep -u ${systemInfo.currentUser} "${processName}" | head -1)/environ | tr '\\0' '\\n' | grep -E '^(DISPLAY|WAYLAND_DISPLAY|XDG_|DBUS_SESSION_BUS_ADDRESS)='`,
        {
          encoding: "utf8",
          timeout: 2000,
        }
      );

      // Parse and merge environment variables
      userEnv.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join("=");
        }
      });

      // If we have enough variables, break
      if (envVars.DBUS_SESSION_BUS_ADDRESS && (envVars.DISPLAY || envVars.WAYLAND_DISPLAY)) {
        break;
      }
    } catch {
      // Continue to next process
    }
  }

  return addMissingEnvironmentVariables(envVars, systemInfo);
}

/**
 * Adds missing common environment variables with sensible defaults
 */
function addMissingEnvironmentVariables(
  envVars: EnvironmentVariables,
  systemInfo: SystemInfo
): EnvironmentVariables {
  const result = { ...envVars };

  if (!result.XDG_RUNTIME_DIR) {
    result.XDG_RUNTIME_DIR = `/run/user/${systemInfo.userId}`;
  }
  if (!result.XDG_CURRENT_DESKTOP) {
    result.XDG_CURRENT_DESKTOP = "GNOME";
  }
  if (!result.XDG_SESSION_DESKTOP) {
    result.XDG_SESSION_DESKTOP = "gnome";
  }
  if (!result.XDG_SESSION_TYPE) {
    result.XDG_SESSION_TYPE = "wayland";
  }
  if (!result.WAYLAND_DISPLAY && !result.DISPLAY) {
    result.WAYLAND_DISPLAY = "wayland-0";
    result.DISPLAY = ":0";
  }

  return result;
}

/**
 * Creates fallback environment variables when GNOME environment detection fails
 */
export function getFallbackEnvironment(systemInfo: SystemInfo): EnvironmentVariables {
  return {
    HOME: systemInfo.userHome,
    USER: systemInfo.currentUser,
    DISPLAY: ":0",
    WAYLAND_DISPLAY: "wayland-0",
    XDG_CURRENT_DESKTOP: "GNOME",
    XDG_SESSION_DESKTOP: "gnome",
    XDG_SESSION_TYPE: "wayland",
    XDG_RUNTIME_DIR: `/run/user/${systemInfo.userId}`,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=/run/user/${systemInfo.userId}/bus`,
    PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  };
}
