import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AttackShopPage";

export const Route = createFileRoute("/attack-shop")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Nova AI - Mine, Battle & Earn Gram" },
      { name: "description", content: "Nova AI: mine NOVA, battle monsters, and earn Gram cryptocurrency" },
    ],
  }),
});
