/**
 * Fetch both display name and profile image for a Telegram username
 */
export async function getTelegramUserData(
  username: string
): Promise<{ displayName: string | null; profileImage: string | null }> {
  try {
    // Use curl instead of fetch for better reliability
    const { exec } = require("node:child_process");
    const { promisify } = require("node:util");
    const execAsync = promisify(exec);

    // Telegram web URL for user profiles
    const url = `https://t.me/${username}`;

    // Use curl to get the HTML with timeout for faster response
    const { stdout: html } = await execAsync(
      `curl -s --max-time 10 -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`
    );

    // Extract both display name and profile image from the same HTML
    const displayName = extractDisplayName(html);
    const profileImage = extractProfileImage(html);

    return { displayName, profileImage };
  } catch (error) {
    console.error(`Error fetching user data for ${username}:`, error);
    return { displayName: null, profileImage: null };
  }
}

/**
 * Fetch display name for a Telegram username (legacy function, kept for compatibility)
 */
export async function getTelegramDisplayName(username: string): Promise<string | null> {
  const { displayName } = await getTelegramUserData(username);
  return displayName;
}

/**
 * Fetch profile image URL for a Telegram username (legacy function, kept for compatibility)
 */
export async function getTelegramProfileImage(username: string): Promise<string | null> {
  const { profileImage } = await getTelegramUserData(username);
  return profileImage;
}

/**
 * Extract display name from Telegram web page HTML
 */
function extractDisplayName(html: string): string | null {
  try {
    // PRIORITY 1: Look for display name in specific Telegram web elements FIRST
    const nameMatch = html.match(
      /class="tgme_page_title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i
    );
    if (nameMatch?.[1]) {
      return nameMatch[1].trim();
    }

    // PRIORITY 2: Look for og:title meta tag
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch?.[1]) {
      return ogTitleMatch[1].trim();
    }

    // PRIORITY 3: Look for JSON-LD structured data
    const jsonLdMatch = html.match(
      /<script\s+type="application\/ld\+json"[^>]*>([^<]+)<\/script>/i
    );
    if (jsonLdMatch?.[1]) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData.name) {
          return jsonData.name;
        }
      } catch (_e) {
        // Ignore JSON parsing errors
      }
    }

    // PRIORITY 4: Look for the display name in the page title (LAST RESORT)
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      const title = titleMatch[1].trim();
      // Remove "Telegram: " prefix if presentk
      const extracted = title
        .replace(/^Telegram:\s*/i, "")
        .split(" (@")[0]
        .trim();
      return extracted;
    }

    return null;
  } catch (error) {
    console.error("Error extracting display name:", error);
    return null;
  }
}

/**
 * Extract profile image URL from Telegram web page HTML
 */
function extractProfileImage(html: string): string | null {
  try {
    // Look for profile image in tgme_page_photo_image
    const imageMatch = html.match(/class="tgme_page_photo_image"[^>]*src="([^"]+)"/i);
    if (imageMatch?.[1]) {
      return imageMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting profile image:", error);
    return null;
  }
}
