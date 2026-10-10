import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import prizeWinnerImg from "@/assets/prize-winner.jpg";



const PrizePopup = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const amount = Number(user.rewardBalance ?? 0) > 0 ? Number(user.rewardBalance) : 9999;

  // Show once on every app open (after the profile loads), and on demand.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (shown || !user.profileId) return;
    setShown(true);
    setOpen(true);
  }, [shown, user.profileId]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("nova:open-prize", handler);
    return () => window.removeEventListener("nova:open-prize", handler);
  }, []);

  const hours = user.rewardExpiresAt
    ? Math.max(0, Math.round((new Date(user.rewardExpiresAt).getTime() - Date.now()) / 3600000))
    : 48;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 px-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="paper-card w-full max-w-sm overflow-hidden p-0 text-center"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={prizeWinnerImg}
              alt="$9,999 — You're the winner"
              className="w-full"
              width={1024}
              height={1024}
            />
            <div className="p-7 pt-5">
              <p className="paper-eyebrow">Welcome Prize</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Your ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} prize has been added to your wallet. It stays active for {hours} hours.
              </p>
            <button
              className="btn-ink mt-6 h-12 w-full text-sm font-semibold"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/wallet" });
              }}
            >
              Open Wallet
            </button>
            <button
              className="mt-3 w-full py-2 text-xs text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrizePopup;
