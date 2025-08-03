import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function FloatingButton({ onClick, className, icon = <Plus className="h-6 w-6" /> }: FloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "floating-btn fixed bottom-8 right-8 w-16 h-16 rounded-2xl shadow-2xl",
        "text-white border-2 border-white/20",
        "group relative overflow-hidden",
        className
      )}
      size="icon"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
}
