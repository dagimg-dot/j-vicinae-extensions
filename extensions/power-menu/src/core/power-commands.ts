import { exec } from "node:child_process";
import { promisify } from "node:util";
import { closeMainWindow, showToast } from "@vicinae/api";

const execAsync = promisify(exec);

interface PowerCommandOptions {
  title: string;
  message: string;
  command: string;
  errorMessage: string;
}

export async function executePowerCommand({
  title,
  message,
  command,
  errorMessage,
}: PowerCommandOptions): Promise<void> {
  try {
    // Show confirmation dialog
    await showToast({
      title,
      message,
    });

    // Execute the primary command
    await execAsync(command);
    await closeMainWindow();
  } catch (error) {
    await showToast({
      title: "Error",
      message: `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Predefined power commands
export const POWER_COMMANDS = {
  POWEROFF: {
    title: "Powering off system...",
    message: "This will shut down your computer immediately",
    command: "systemctl poweroff",
    errorMessage: "Failed to power off",
  },
  REBOOT: {
    title: "Rebooting system...",
    message: "This will restart your computer immediately",
    command: "systemctl reboot",
    errorMessage: "Failed to reboot",
  },
  SUSPEND: {
    title: "Suspending system...",
    message: "Putting computer to sleep",
    command: "systemctl suspend",
    errorMessage: "Failed to suspend",
  },
  HIBERNATE: {
    title: "Hibernating system...",
    message: "Saving state to disk and powering off",
    command: "systemctl hibernate",
    errorMessage: "Failed to hibernate",
  },
  LOGOUT: {
    title: "Logging out...",
    message: "This will end your current session",
    command: "gnome-session-quit --logout --no-prompt",
    errorMessage: "Failed to logout",
  },
  LOCK_SCREEN: {
    title: "Locking screen...",
    message: "Securing your session",
    command: "loginctl lock-session",
    errorMessage: "Failed to lock screen",
  },
  REBOOT_UEFI: {
    title: "Rebooting to UEFI...",
    message: "Restarting to firmware setup",
    command: "systemctl reboot --firmware-setup",
    errorMessage: "Failed to reboot to UEFI",
  },
  REBOOT_RECOVERY: {
    title: "Rebooting to Recovery...",
    message: "Restarting to recovery mode",
    command: "systemctl reboot --boot-loader-entry=auto-windows",
    errorMessage: "Failed to reboot to recovery",
  },
} as const;
