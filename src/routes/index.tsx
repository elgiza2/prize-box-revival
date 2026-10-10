import { createFileRoute } from "@tanstack/react-router";
import MiningPage from "@/pages/MiningPage";

export const Route = createFileRoute("/")({
  component: MiningPage,
  head: () => ({
    meta: [
      { title: "Nova - Mine NOVA, TON and USDT in Telegram" },
      { name: "description", content: "Nova: mine NOVA, TON and USDT every 8 hours, complete tasks and invite friends, right inside Telegram." },
      { property: "og:title", content: "Nova - Mine NOVA, TON and USDT in Telegram" },
      { property: "og:description", content: "Mine every 8 hours, complete tasks and invite friends, right inside Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
