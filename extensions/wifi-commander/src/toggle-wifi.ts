import { clearSearchBar, showToast } from "@vicinae/api";
import { executeNmcliCommandSilent } from "./utils/execute";

export default async function ToggleWifi() {
  await clearSearchBar();

  try {
    // Check current wifi status
    const statusResult = await executeNmcliCommandSilent("radio wifi");

    if (!statusResult.success) {
      await showToast({
        title: "Error",
        message: "Failed to check wifi status",
      });
      return;
    }

    const isEnabled = statusResult.stdout.trim() === "enabled";
    const newState = isEnabled ? "off" : "on";

    // Toggle wifi state
    const toggleResult = await executeNmcliCommandSilent(`radio wifi ${newState}`);

    if (toggleResult.success) {
      await showToast({
        title: `Wifi ${newState === "on" ? "Enabled" : "Disabled"}`,
        message: `Wifi has been turned ${newState}`,
      });
    } else {
      await showToast({
        title: "Error",
        message: `Failed to toggle wifi: ${toggleResult.error}`,
      });
    }
  } catch (_error) {
    await showToast({
      title: "Error",
      message: "An unexpected error occurred while toggling wifi",
    });
  }
}
