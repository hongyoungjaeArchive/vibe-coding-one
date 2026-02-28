import { TOOL_COLORS } from "./constants";

export const getToolColor = (tool: string): string => {
  const normalized = tool.toLowerCase();
  return TOOL_COLORS[normalized] || "bg-tool-other";
};

export const getToolBgClass = (tool: string): string => {
  const map: Record<string, string> = {
    cursor: "bg-tool-cursor",
    claude: "bg-tool-claude",
    bolt: "bg-tool-bolt",
    v0: "bg-tool-v0",
    gpt: "bg-tool-gpt",
    replit: "bg-tool-replit",
  };
  return map[tool.toLowerCase()] || "bg-tool-other";
};

export const TOOL_HEX: Record<string, string> = {
  cursor: "#0066FF",
  claude: "#FF6B35",
  bolt: "#FFB800",
  v0: "#000000",
  gpt: "#10A37F",
  replit: "#F26207",
};

export const getToolHex = (tool: string): string => {
  return TOOL_HEX[tool.toLowerCase()] || "#888888";
};
