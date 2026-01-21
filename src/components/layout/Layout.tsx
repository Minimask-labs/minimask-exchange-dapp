import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { WalletPanel } from "@/components/wallet/WalletPanel";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isWalletPanelOpen, setIsWalletPanelOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-jumper-dark to-background -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(270_70%_60%/0.1),transparent_50%)] -z-10" />
      
      {/* Header */}
      <Header
        onWalletClick={() => setIsWalletPanelOpen(true)}
        isWalletConnected={false}
      />
      
      {/* Side Menu - Hidden on mobile */}
      <div className="hidden lg:block">
        <SideMenu />
      </div>
      
      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 lg:pl-20">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      
      {/* Wallet Panel */}
      <WalletPanel
        isOpen={isWalletPanelOpen}
        onClose={() => setIsWalletPanelOpen(false)}
      />
    </div>
  );
};

export { Layout };
