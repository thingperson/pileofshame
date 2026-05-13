// Social / community links — single source of truth.
// Update DISCORD_INVITE_URL with the permanent invite from Discord
// (Server name dropdown → Invite People → Edit invite link → Never / No limit).

export const DISCORD_INVITE_URL = 'https://discord.gg/gJdmmymGg3';

// Pip — the Discord bot. The App ID is the public Application ID from the
// Discord Developer Portal (Pip → General Information → Application ID). It's
// public by design (appears in every OAuth invite URL), safe to hardcode.
// permissions=18432 = Send Messages (2048) + Embed Links (16384). Slash command
// dispatch is granted by the `applications.commands` scope, no separate perm.
export const PIP_BOT_APP_ID = '1504065907427901480';
export const PIP_BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${PIP_BOT_APP_ID}&permissions=18432&scope=bot+applications.commands`;

export const SOCIAL_LINKS = {
  discord: DISCORD_INVITE_URL,
  pipBot: PIP_BOT_INVITE_URL,
} as const;
