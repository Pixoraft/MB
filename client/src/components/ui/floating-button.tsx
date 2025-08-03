import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function FloatingButton({ onClick, className, icon = <Plus className="h-5 w-5" /> }: FloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn("floating-btn-clean", className)}
      size="icon"
    >
      {icon}
    </Button>
  );
}
