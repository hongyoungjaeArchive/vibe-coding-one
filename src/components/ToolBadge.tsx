import { getToolHex } from "@/lib/tools";

interface ToolBadgeProps {
  tool: string;
  size?: "sm" | "md";
}

export function ToolBadge({ tool, size = "sm" }: ToolBadgeProps) {
  const hex = getToolHex(tool);
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${hex}18`,
        color: hex,
        border: `1px solid ${hex}30`,
      }}
    >
      {tool}
    </span>
  );
}
