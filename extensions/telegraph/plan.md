That plan is **absolutely perfect** — clean, minimal, and *feels native*.
You’re basically building a **progressively self-populating Telegram launcher**, and your flow design is exactly how a Raycast-quality extension should behave 👇

---

## ⚙️ Your Proposed Flow — Step by Step (with commentary)

### 🧩 Step 1: Start Empty

> “One list view (empty at first)”
> ✅ That’s perfect.
> The list view will eventually show your locally stored username→displayName mappings.

At first, it’s empty because you haven’t opened any usernames yet.

---

### 🧭 Step 2: Open by Username (via Autocomplete Command)

> “Users open using username through autocomplete command”
> ✅ The autocomplete allows free text input — ideal for typing `durov` or `john_doe`.

When they hit Enter:

```bash
xdg-open 'tg://resolve?domain=username'
```

That launches Telegram **directly into the chat** on Linux — no middleman.
💥 Smooth as butter.

---

### 🧠 Step 3: Fetch & Store Display Name

Once the command runs, you asynchronously:

1. Call the scraping function (`getTelegramDisplayName`).
2. Store `{ username, displayName }` locally (e.g. in Vicinae’s storage, or fallback to a JSON file under `~/.config/vicinae/extensions/telegram.json`).

So now you have:

```json
{
  "durov": "Pavel Durov",
  "telegram": "Telegram"
}
```

---

### 🧾 Step 4: Populate List View

> “Next time I open the list view, I can find this user by display name”
> ✅ Exactly.
> Now your list view can show:

```
Pavel Durov (@durov)
Telegram (@telegram)
```

Clicking an item → retrieves the `username` →
opens via `tg://resolve?domain=username` again.

---

### 💡 Step 5: Optional Enhancements

Here are some small but powerful tweaks you can add easily later:

1. **Auto-refresh Display Names**

   * When you select a user, check if the cached name is older than, say, a week → refresh it silently in the background.

2. **Pinned Users / Favorites**

   * Allow users to pin their frequent contacts at the top.

3. **Search in List View**

   * Vicinae supports search input filtering — perfect for large lists.

4. **Delete / Clear**

   * Add an action to remove a user from the cache.

---

### ⚙️ Storage Suggestion

For storage, you can use Vicinae’s `storage` API (if available) or just simple Node.js file persistence:

```ts
import fs from "fs";
import path from "path";

const storePath = path.join(process.env.HOME!, ".config/vicinae/telegram-users.json");

export function getStoredUsers(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(storePath, "utf8"));
  } catch {
    return {};
  }
}

export function saveUser(username: string, displayName: string) {
  const users = getStoredUsers();
  users[username] = displayName;
  fs.writeFileSync(storePath, JSON.stringify(users, null, 2));
}
```

---

## 🚀 The Result

✅ First time → user types username manually
✅ You open Telegram directly
✅ Fetch + cache display name
✅ Next time → user selects from your sleek list view
✅ You open Telegram instantly

That’s **fast**, **offline-friendly**, and **privacy-safe** (no login, no API keys).

---

Would you like me to show a **full working Vicinae extension scaffold** (commands folder, manifest.json, and TypeScript files) implementing this exact flow next?
That way, you could just drop it into `~/.local/share/vicinae/extensions/telegram-launcher` and test it right away.
