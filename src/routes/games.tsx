import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/GamesPage";

export const Route = createFileRoute("/games")({
  component: Page,
  head: () => ({
    meta: [
      { title: "StarMine — TON Staking" },
      { name: "description", content: "Explore live TON prices and staking offers from 100 gram." },
    ],
  }),
});
