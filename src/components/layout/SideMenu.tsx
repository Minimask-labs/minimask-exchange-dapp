import { Link, useLocation } from "react-router-dom";
import { ArrowLeftRight, LayoutGrid, TrendingUp, Target, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { path: "/", icon: ArrowLeftRight, label: "Exchange" },
  { path: "/portfolio", icon: LayoutGrid, label: "Portfolio" },
  { path: "/missions", icon: Target, label: "Missions" },
  { path: "/earn", icon: Coins, label: "Earn" },
];

const SideMenu = () => {
  const location = useLocation();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-jumper-border">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-jumper-border">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export { SideMenu };
