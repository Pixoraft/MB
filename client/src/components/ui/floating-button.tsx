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
        "floating-btn fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-300 hover:scale-110",
        className
      )}
      size="icon"
    >
      {icon}
    </Button>
  );
}
