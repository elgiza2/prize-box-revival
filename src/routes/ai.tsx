import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/GamesPage";

export const Route = createFileRoute("/ai")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Nova AI Games - Play Crash & Earn Gram" },
      { name: "description", content: "Play Crash and other games in Nova AI and win Gram." },
      { property: "og:title", content: "Nova AI Games - Play Crash & Earn Gram" },
      { property: "og:description", content: "Play Crash and other games in Nova AI and win Gram." },
    ],
  }),
});
