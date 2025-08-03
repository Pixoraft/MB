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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-gradient-primary">
                Meta Build
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
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
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gradient-primary mb-2">Navigation</h2>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
                    </div>
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <NavLink 
                          key={item.path} 
                          path={item.path} 
                          label={`${item.icon} ${item.label}`}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
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
