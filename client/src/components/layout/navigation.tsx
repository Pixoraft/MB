import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: "✨" },
  { path: "/daily-task", label: "Tasks", icon: "🎯" },
  { path: "/workout", label: "Fitness", icon: "💪" },
  { path: "/mind-workout", label: "Mindset", icon: "🧠" },
  { path: "/daily-routine", label: "Routine", icon: "⚡" },
  { path: "/dev-tracker", label: "Goals", icon: "🚀" },
];

export function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const NavLink = ({ path, label, onClick }: { path: string; label: string; onClick?: () => void }) => (
    <Link href={path} onClick={onClick}>
      <span
        className={`nav-link-clean ${
          location === path ? "active" : ""
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <nav className="nav-clean sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gradient-primary">
                Meta Build
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.path} path={item.path} label={`${item.icon} ${item.label}`} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="premium-button h-12 w-12 rounded-xl">
                    <Menu className="h-5 w-5 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 glass-effect border-l border-gray-200/20">
                  <div className="flex flex-col space-y-6 mt-12">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gradient-primary mb-2">Navigation</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
                    </div>
                    {navItems.map((item) => (
                      <NavLink 
                        key={item.path} 
                        path={item.path} 
                        label={`${item.icon} ${item.label}`}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
