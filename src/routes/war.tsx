import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/WarPage";

export const Route = createFileRoute("/war")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Nova AI - Mine, Battle & Earn Gram" },
      { name: "description", content: "Nova AI: mine NOVA, battle monsters, and earn Gram cryptocurrency" },
    ],
  }),
});
