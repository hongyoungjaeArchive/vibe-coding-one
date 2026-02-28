import { motion } from "framer-motion";
import { ReactNode } from "react";
import { floatAnimation } from "@/lib/animations";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        animate={floatAnimation.animate}
        transition={floatAnimation.transition}
        className="mb-6 text-muted-foreground"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
