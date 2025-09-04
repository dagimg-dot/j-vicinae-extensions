import { execSync } from "node:child_process";

export interface SystemInfo {
  currentUser: string;
  userHome: string;
  userId: string;
}

/**
 * Gets current system user information
 */
export function getSystemInfo(): SystemInfo {
  const currentUser = execSync("whoami", { encoding: "utf8" }).trim();
  const userHome = execSync("echo $HOME || getent passwd $(whoami) | cut -d: -f6", {
    encoding: "utf8",
  }).trim();
  const userId = execSync("id -u", { encoding: "utf8" }).trim();

  return {
    currentUser,
    userHome,
    userId,
  };
}
