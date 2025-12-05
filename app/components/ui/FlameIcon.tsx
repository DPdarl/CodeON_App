// app/components/ui/FlameIcon.tsx
import { cn } from "~/lib/utils";

interface IconProps {
  className?: string;
}

export default function FlameIcon({ className }: IconProps) {
  // Default size if none provided, but allow overrides via className
  const sizeClasses = className?.includes("h-") ? "" : "h-8 w-8";

  return (
    <>
      {/* Light Mode Logo */}
      <img
        src="/assets/icons/flame.png"
        alt="Streak"
        className={cn(
          `block dark:hidden object-contain ${sizeClasses}`,
          className
        )}
      />
      {/* Dark Mode Logo */}
      <img
        src="/assets/icons/flame.png"
        alt="Streak"
        className={cn(
          `hidden dark:block object-contain ${sizeClasses}`,
          className
        )}
      />
    </>
  );
}
