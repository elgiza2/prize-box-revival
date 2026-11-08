import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/TasksPage";

export const Route = createFileRoute("/tasks")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Clo - Mine, Battle & Earn CL" },
      { name: "description", content: "Clo: earn CL, complete missions, and collect Gram rewards" },
    ],
  }),
});
