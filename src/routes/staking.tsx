import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/StakingPage";

export const Route = createFileRoute("/staking")({
  component: Page,
  head: () => ({
    meta: [
      { title: "StarMine — TON Staking" },
      { name: "description", content: "Explore live TON prices and staking offers from 100 gram." },
      { property: "og:title", content: "StarMine — TON Staking" },
      { property: "og:description", content: "Choose fixed-term staking plans, track rewards, and manage active bonds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
