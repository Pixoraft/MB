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
  { path: "/skincare", label: "Skincare", icon: "🧴" },
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
        className={`nav-link px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
          location === path
            ? "text-white bg-gradient-to-r from-primary to-accent shadow-lg scale-105"
            : "text-gray-700 dark:text-gray-200 hover:text-white hover:scale-105"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        <span className="relative z-10">{label}</span>
      </span>
    </Link>
  );

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-black text-gradient-primary tracking-tight">
                Meta Build
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-1"></div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <NavLink key={item.path} path={item.path} label={`${item.icon} ${item.label}`} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="premium-button relative overflow-hidden group h-12 w-12 rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                {theme === "dark" ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
              </div>
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
