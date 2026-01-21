import { Link, useLocation } from "react-router-dom";
import { Wallet, MoreHorizontal, Star, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton";

const navItems = [
  { path: "/", label: "Exchange" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/missions", label: "Missions" },
  { path: "/earn", label: "Earn" },
];

interface HeaderProps {
  onWalletClick: () => void;
  isWalletConnected?: boolean;
  points?: number;
}

const Header = ({ onWalletClick, isWalletConnected = false, points = 0 }: HeaderProps) => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">J</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">Jumper</span>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-card/60 backdrop-blur-xl border border-jumper-border">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Points Badge */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-jumper-border text-sm font-medium hover:bg-secondary transition-colors">
            <Star className="w-4 h-4 text-warning" />
            <span>{points.toLocaleString()}</span>
          </button>

          {/* Pass Button */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-jumper-border text-sm font-medium hover:bg-secondary transition-colors">
            <Ticket className="w-4 h-4 text-primary" />
            <span>Pass</span>
          </button>

          {/* Wallet Button */}
          <button
            onClick={onWalletClick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isWalletConnected
                ? "bg-card/60 backdrop-blur-xl border border-jumper-border hover:bg-secondary"
                : "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-button hover:brightness-110"
            )}
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isWalletConnected ? "Wallets" : "Connect"}
            </span>
          </button>

          {/* Menu Button */}
          <IconButton variant="ghost" size="md">
            <MoreHorizontal className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </header>
  );
};

export { Header };
