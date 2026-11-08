import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/WalletPage";

export const Route = createFileRoute("/wallet")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Clo - Mine, Battle & Earn CL" },
      { name: "description", content: "Clo: earn CL, battle monsters, and collect Gram rewards" },
    ],
  }),
});
