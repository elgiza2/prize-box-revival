import { Pickaxe, ChartNoAxesCombined, ClipboardCheck, Boxes, WalletCards } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Pickaxe, label: "Mine" },
  { to: "/games", icon: ChartNoAxesCombined, label: "Staking" },
  { to: "/tasks", icon: ClipboardCheck, label: "Tasks" },
  { to: "/servers", icon: Boxes, label: "NFT" },
  { to: "/wallet", icon: WalletCards, label: "Wallet" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
        <motion.nav
          key="bottom-nav"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] pt-2"
        >
          <div className="liquid-glass mx-auto flex max-w-sm items-center justify-between gap-1 rounded-full px-2 py-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                    const scrollingElement = document.scrollingElement;
                    if (scrollingElement) scrollingElement.scrollTop = 0;
                  }}
                  
                  
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[20px] py-1.5"
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                       className="absolute inset-0 rounded-[20px] bg-foreground/10"
                      transition={{ type: "spring", stiffness: 480, damping: 40 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative h-[19px] w-[19px] shrink-0 transition-colors duration-200",
                       isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                  <span
                    className={cn(
                      "relative text-[10px] font-medium tracking-tight transition-colors duration-200",
                       isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
  );
};

export default BottomNav;
