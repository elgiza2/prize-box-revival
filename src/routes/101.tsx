import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminPage";

export const Route = createFileRoute("/101")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Clo - Mine, Battle & Earn CL" },
      { name: "description", content: "Clo: earn CL, battle monsters, and collect Gram rewards" },
    ],
  }),
});
