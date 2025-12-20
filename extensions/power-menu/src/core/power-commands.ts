import { spawn } from "node:child_process";
import {
  Alert,
  closeMainWindow,
  confirmAlert,
  getPreferenceValues,
  showToast,
  Toast,
} from "@vicinae/api";

interface PowerCommandOptions {
  title: string;
  loading: string;
  message: string;
  command: string;
  errorMessage: string;
  interactiveCommand?: string;
}

/**
 * Spawn a system command that is fully detached from the extension lifecycle.
 */
function fireAndForget(command: string) {
  const child = spawn(command, {
    shell: true,
    detached: true,
    stdio: "ignore",
  });

  // Allow the parent (extension) to exit independently
  child.unref();
}

export async function executePowerCommandWithConfirmation({
  title,
  loading,
  message,
  command,
  errorMessage,
  interactiveCommand,
}: PowerCommandOptions): Promise<void> {
  try {
    const confirmed = await confirmAlert({
      title: `Confirm ${title}`,
      message,
      primaryAction: {
        title,
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (!confirmed) {
      return;
    }

    // Show feedback immediately
    await showToast({
      title: loading,
      style: Toast.Style.Animated,
    });

    /**
     * closeMainWindow() is async but NOT blocking
     * we must allow the host to start tearing down the UI
     */
    await closeMainWindow();

    /**
     * Execute on next tick so the window-close request
     * is processed before spawning the command.
     */
    setTimeout(() => {
      try {
        fireAndForget(command);
      } catch (error) {
        if (interactiveCommand) {
          fireAndForget(interactiveCommand);
        } else {
          console.error("Power command failed:", error);
        }
      }
    }, 200);
  } catch (error) {
    await showToast({
      title: "Error",
      message: `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
      style: Toast.Style.Failure,
    });
  }
}

// Predefined power commands
// Dynamic command functions for DE-specific operations
export async function getLockCommand(): Promise<string> {
  const prefs = getPreferenceValues();
  return prefs["lock-command"] || POWER_COMMANDS.LOCK_SCREEN.command;
}

export async function getLogoutCommand(): Promise<string> {
  const prefs = getPreferenceValues();
  return prefs["logout-command"] || POWER_COMMANDS.LOGOUT.command;
}

// Functions to execute dynamic commands
export async function executeLockScreen(): Promise<void> {
  const command = await getLockCommand();
  await executePowerCommandWithConfirmation({
    title: "Lock Screen",
    loading: "Locking screen...",
    message: "This will lock your screen and require authentication to unlock",
    command,
    errorMessage: "Failed to lock screen",
  });
}

export async function executeLogout(): Promise<void> {
  const command = await getLogoutCommand();
  await executePowerCommandWithConfirmation({
    title: "Logout",
    loading: "Logging out...",
    message: "This will end your current session and close all applications",
    command,
    errorMessage: "Failed to logout",
  });
}

export const POWER_COMMANDS = {
  POWEROFF: {
    title: "Power Off",
    loading: "Powering off system...",
    message: "This will shut down your computer immediately",
    command: "systemctl poweroff",
    interactiveCommand: "systemctl poweroff -i",
    errorMessage: "Failed to power off",
  },
  REBOOT: {
    title: "Reboot",
    loading: "Rebooting system...",
    message: "This will restart your computer immediately",
    command: "systemctl reboot",
    interactiveCommand: "systemctl reboot -i",
    errorMessage: "Failed to reboot",
  },
  SUSPEND: {
    title: "Suspend",
    loading: "Suspending system...",
    message: "Putting computer to sleep",
    command: "systemctl suspend",
    interactiveCommand: "systemctl suspend -i",
    errorMessage: "Failed to suspend",
  },
  HIBERNATE: {
    title: "Hibernate",
    loading: "Hibernating system...",
    message: "Saving state to disk and powering off",
    command: "systemctl hibernate",
    interactiveCommand: "systemctl hibernate -i",
    errorMessage: "Failed to hibernate",
  },
  LOGOUT: {
    title: "Logout",
    loading: "Logging out...",
    message: "This will end your current session",
    command: "gnome-session-quit --logout --no-prompt",
    errorMessage: "Failed to logout",
  },
  LOCK_SCREEN: {
    title: "Lock Screen",
    loading: "Locking screen...",
    message: "Securing your session",
    command: "loginctl lock-session",
    errorMessage: "Failed to lock screen",
  },
  REBOOT_UEFI: {
    title: "Reboot to UEFI",
    loading: "Rebooting to UEFI...",
    message: "Restarting to firmware setup",
    command: "systemctl reboot --firmware-setup",
    interactiveCommand: "systemctl reboot --firmware-setup -i",
    errorMessage: "Failed to reboot to UEFI",
  },
  REBOOT_RECOVERY: {
    title: "Reboot to Recovery",
    loading: "Rebooting to Recovery...",
    message: "Restarting to recovery mode",
    command: "systemctl reboot --boot-loader-entry=auto-windows",
    interactiveCommand: "systemctl reboot --boot-loader-entry=auto-windows -i",
    errorMessage: "Failed to reboot to recovery",
  },
} as const;
