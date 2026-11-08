import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/WarPage";

export const Route = createFileRoute("/war")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Clo - Mine, Battle & Earn CL" },
      { name: "description", content: "Clo: earn CL, battle monsters, and collect Gram rewards" },
    ],
  }),
});
