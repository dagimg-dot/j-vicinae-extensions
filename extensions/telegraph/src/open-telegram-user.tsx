import { exec } from "node:child_process";
import { promisify } from "node:util";
import { closeMainWindow, showToast } from "@vicinae/api";
import { getStoredUsers, saveUser } from "./utils/storage";

const execAsync = promisify(exec);

interface LaunchProps {
  arguments: {
    username: string;
  };
}

export default async function OpenTelegramUser(props: LaunchProps) {
  const { username } = props.arguments;

  if (!username || username.trim() === "") {
    await showToast({
      title: "Invalid username",
      message: "Please provide a valid Telegram username",
    });
    return;
  }

  const cleanUsername = username.trim().replace(/^@/, ""); // Remove @ prefix if present

  try {
    // First, save the username - display name will be fetched when list view loads
    try {
      const existingUsers = await getStoredUsers();
      if (!existingUsers[cleanUsername]) {
        // Save username with empty display name for now
        await saveUser(cleanUsername, "");
      }
    } catch (error) {
      console.error(`Failed to save username @${cleanUsername}:`, error);
    }

    // Now try to open Telegram
    await execAsync(`xdg-open 'tg://resolve?domain=${cleanUsername}'`);

    // Show immediate feedback
    await showToast({
      title: `Opening @${cleanUsername}`,
      message: "Launching Telegram...",
    });

    // Close the main window since this is a no-view command
    await closeMainWindow();
  } catch (error) {
    console.error("Failed to open Telegram:", error);
    await showToast({
      title: "Failed to open Telegram",
      message: `Could not launch Telegram for @${cleanUsername}`,
    });
  }
}
