import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Image,
  List,
  showToast,
  useNavigation,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import { getTelegramUserData } from "./utils/scraping";
import {
  clearAllUsers,
  getStoredUsers,
  removeUser,
  saveUser,
  type TelegramUserData,
} from "./utils/storage";

const execAsync = promisify(exec);

interface TelegramUser {
  username: string;
  displayName: string;
  profileImage?: string;
}

export default function TelegraphList() {
  const { push, pop } = useNavigation();
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const storedUsers = await getStoredUsers();
      const userList = Object.entries(storedUsers).map(([username, userData]) => ({
        username,
        displayName: userData.displayName,
        profileImage: userData.profileImage,
      }));
      setUsers(userList);

      // Fetch missing data for users
      await fetchMissingData(storedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
      await showToast({
        title: "Failed to load users",
        message: "Could not load saved Telegram users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMissingData = async (storedUsers: Record<string, TelegramUserData>) => {
    // Only fetch display names for users with invalid/missing display names (on initial load)
    const usersToFetch = Object.entries(storedUsers)
      .filter(
        ([_, userData]) =>
          !userData.displayName ||
          userData.displayName.trim() === "" ||
          userData.displayName.startsWith("Contact @")
      )
      .map(([username]) => username);

    if (usersToFetch.length === 0) {
      return;
    }

    for (const username of usersToFetch) {
      try {
        const { displayName: fetchedDisplayName, profileImage: fetchedProfileImage } =
          await getTelegramUserData(username);

        const displayName =
          fetchedDisplayName || username.charAt(0).toUpperCase() + username.slice(1);
        const profileImage = fetchedProfileImage;

        // Update storage
        await saveUser(username, displayName, profileImage);

        // Update the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.username === username ? { ...user, displayName, profileImage } : user
          )
        );
      } catch (error) {
        console.error(`Failed to fetch data for @${username}:`, error);
        // On error, just use fallback display name
        const displayName = username.charAt(0).toUpperCase() + username.slice(1);
        await saveUser(username, displayName, undefined);
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.username === username ? { ...user, displayName } : user))
        );
      }
    }
  };

  const refreshUser = async (username: string) => {
    try {
      await showToast({
        title: "Refreshing user data...",
        message: `Fetching latest data for @${username}`,
      });

      const { displayName: fetchedDisplayName, profileImage: fetchedProfileImage } =
        await getTelegramUserData(username);

      const displayName =
        fetchedDisplayName || username.charAt(0).toUpperCase() + username.slice(1);
      const profileImage = fetchedProfileImage;

      // Update storage
      await saveUser(username, displayName, profileImage);

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.username === username ? { ...user, displayName, profileImage } : user
        )
      );

      await showToast({
        title: "User data refreshed",
        message: `@${username} data has been updated`,
      });
    } catch (error) {
      console.error(`Failed to refresh data for @${username}:`, error);
      await showToast({
        title: "Refresh failed",
        message: `Could not update data for @${username}`,
        style: Toast.Style.Failure,
      });
    }
  };

  const editUserName = (username: string, currentDisplayName: string) => {
    push(
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Save Name"
              onSubmit={(values: { displayName: string }) => {
                updateUserDisplayName(username, values.displayName);
              }}
            />
          </ActionPanel>
        }
      >
        <Form.TextField
          id="displayName"
          title="Display Name"
          placeholder="Enter custom display name"
          defaultValue={currentDisplayName}
        />
      </Form>
    );
  };

  const updateUserDisplayName = async (username: string, newDisplayName: string) => {
    try {
      // Get current user data
      const storedUsers = await getStoredUsers();
      const userData = storedUsers[username];

      if (userData) {
        // Update storage with new display name
        await saveUser(username, newDisplayName, userData.profileImage);

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.username === username ? { ...user, displayName: newDisplayName } : user
          )
        );

        await showToast({
          title: "Name updated",
          message: `@${username} display name has been changed to "${newDisplayName}"`,
        });

        // Go back to the list view
        pop();
      }
    } catch (error) {
      console.error(`Failed to update display name for @${username}:`, error);
      await showToast({
        title: "Update failed",
        message: `Could not update name for @${username}`,
        style: Toast.Style.Failure,
      });
    }
  };

  const openTelegramUser = async (username: string) => {
    try {
      await execAsync(`xdg-open 'tg://resolve?domain=${username}'`);
      await showToast({
        title: `Opening @${username}`,
        message: "Launching Telegram...",
      });
    } catch (error) {
      console.error("Failed to open Telegram:", error);
      await showToast({
        title: "Failed to open Telegram",
        message: "Could not launch Telegram application",
      });
    }
  };

  const deleteUser = async (username: string) => {
    try {
      await removeUser(username);
      await loadUsers(); // Refresh the list
      await showToast({
        title: "User removed",
        message: `@${username} has been removed from your list`,
      });
    } catch (error) {
      console.error("Failed to remove user:", error);
      await showToast({
        title: "Failed to remove user",
        message: "Could not remove user from storage",
      });
    }
  };

  const clearAll = async () => {
    try {
      await clearAllUsers();
      setUsers([]);
      await showToast({
        title: "All users cleared",
        message: "Your Telegram user list has been cleared",
      });
    } catch (error) {
      console.error("Failed to clear users:", error);
      await showToast({
        title: "Failed to clear users",
        message: "Could not clear user list",
      });
    }
  };

  return (
    <List searchBarPlaceholder="Search Telegram users..." isLoading={isLoading} filtering={true}>
      <List.Section
        title="Telegram Users"
        subtitle={users.length > 0 ? `${users.length} users` : "No users yet"}
      >
        {users.length === 0 && !isLoading ? (
          <List.EmptyView
            title="No Telegram users yet"
            description="Use the 'Open Telegram User' command to add users to this list"
            icon={Icon.Person}
          />
        ) : (
          users.map((user) => (
            <List.Item
              key={user.username}
              title={user.displayName}
              subtitle={`@${user.username}`}
              icon={
                user.profileImage
                  ? {
                      source: user.profileImage,
                      mask: Image.Mask.Circle,
                    }
                  : {
                      source: "https://telegram.org/img/t_logo.png",
                      mask: Image.Mask.Circle,
                    }
              }
              keywords={[user.username]}
              actions={
                <ActionPanel>
                  <Action
                    title="Open in Telegram"
                    icon={Icon.ArrowRight}
                    onAction={() => openTelegramUser(user.username)}
                  />
                  <Action
                    title="Edit Name"
                    icon={Icon.Pencil}
                    onAction={() => editUserName(user.username, user.displayName)}
                  />
                  <Action
                    title="Refresh Data"
                    icon={Icon.ArrowClockwise}
                    onAction={() => refreshUser(user.username)}
                  />
                  <Action
                    title="Remove User"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => deleteUser(user.username)}
                  />
                  {users.length > 1 && (
                    <Action
                      title="Clear All Users"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={clearAll}
                    />
                  )}
                </ActionPanel>
              }
            />
          ))
        )}
      </List.Section>
    </List>
  );
}
