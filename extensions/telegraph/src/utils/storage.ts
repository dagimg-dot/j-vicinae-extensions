import { LocalStorage } from "@vicinae/api";

export interface TelegramUserData {
  displayName: string;
  profileImage?: string;
}

export interface UserMapping {
  [username: string]: TelegramUserData; // username -> { displayName, profileImage? }
}

const STORAGE_KEY = "telegram-users";

/**
 * Get all stored user mappings from LocalStorage
 */
export async function getStoredUsers(): Promise<UserMapping> {
  try {
    const stored = await LocalStorage.getItem<string>(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};

    // Convert old format (username -> displayName) to new format (username -> { displayName, profileImage? })
    const result: UserMapping = {};
    for (const [username, value] of Object.entries(data)) {
      if (typeof value === "string") {
        // Old format: convert to new format
        result[username] = { displayName: value };
      } else if (typeof value === "object" && value !== null) {
        // Already in new format
        result[username] = value as TelegramUserData;
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to load stored users:", error);
    return {};
  }
}

/**
 * Save a user mapping to LocalStorage
 */
export async function saveUser(
  username: string,
  displayName: string,
  profileImage?: string
): Promise<void> {
  try {
    const users = await getStoredUsers();
    users[username] = {
      displayName,
      ...(profileImage && { profileImage }),
    };
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save user:", error);
    throw error;
  }
}

/**
 * Remove a user from storage
 */
export async function removeUser(username: string): Promise<void> {
  try {
    const users = await getStoredUsers();
    delete users[username];
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to remove user:", error);
    throw error;
  }
}

/**
 * Clear all stored users
 */
export async function clearAllUsers(): Promise<void> {
  try {
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  } catch (error) {
    console.error("Failed to clear users:", error);
    throw error;
  }
}
