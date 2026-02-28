export const TOOLS = [
  { name: "Cursor", key: "cursor" },
  { name: "Claude", key: "claude" },
  { name: "Bolt", key: "bolt" },
  { name: "v0", key: "v0" },
  { name: "GPT", key: "gpt" },
  { name: "Replit", key: "replit" },
  { name: "기타", key: "other" },
] as const;

export const TOOL_COLORS: Record<string, string> = {
  cursor: "bg-tool-cursor",
  claude: "bg-tool-claude",
  bolt: "bg-tool-bolt",
  v0: "bg-tool-v0",
  gpt: "bg-tool-gpt",
  replit: "bg-tool-replit",
  other: "bg-tool-other",
};

export const VIBE_RANKS = [
  { min: 0, max: 49, label: "Newbie", emoji: "🌱" },
  { min: 50, max: 149, label: "Builder", emoji: "🔨" },
  { min: 150, max: 299, label: "Vibe Pro", emoji: "⚡" },
  { min: 300, max: Infinity, label: "Legend", emoji: "🔥" },
] as const;

export const getVibeRank = (score: number) => {
  return VIBE_RANKS.find((r) => score >= r.min && score <= r.max) || VIBE_RANKS[0];
};
