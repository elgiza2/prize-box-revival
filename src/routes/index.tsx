import { createFileRoute } from "@tanstack/react-router";
import MiningPage from "@/pages/MiningPage";

export const Route = createFileRoute("/")({
  component: MiningPage,
  head: () => ({
    meta: [
      { title: "Clo - Earn CL, TON and USDT in Telegram" },
      { name: "description", content: "Clo: earn CL, TON and USDT, complete missions and invite friends inside Telegram." },
      { property: "og:title", content: "Clo - Earn CL, TON and USDT in Telegram" },
      { property: "og:description", content: "Mine every 8 hours, complete tasks and invite friends, right inside Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
