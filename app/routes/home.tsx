import { useEffect } from "react";
import { useLocation } from "react-router";
import type { Route } from "./+types/home";
import { pageMeta } from "~/lib/site";
import { ExperienceProvider, useTier } from "~/lib/experience";
import { scrollToId } from "~/lib/scroll";
import { Nav } from "~/components/Nav";
import { SceneLayer } from "~/components/SceneLayer";
import { Controller } from "~/components/Controller";
import { Hero } from "~/components/sections/Hero";
import { Send } from "~/components/sections/Send";
import { Journey } from "~/components/sections/Journey";
import { Arrived } from "~/components/sections/Arrived";
import { Network } from "~/components/sections/Network";
import { Dashboard } from "~/components/sections/Dashboard";
import { Trust } from "~/components/sections/Trust";
import { DevelopersStrip } from "~/components/sections/Developers";
import { HowItsMade } from "~/components/sections/HowItsMade";
import { Footer } from "~/components/Footer";

export const meta: Route.MetaFunction = () => pageMeta("Arcway: send money like you send a message (concept)");
export const links: Route.LinksFunction = () => [{ rel: "preload", href: "/posters/hero.webp", as: "image", type: "image/webp" }];

function HashSync() {
  const tier = useTier();
  const { hash } = useLocation();
  useEffect(() => {
    if (tier === "pending" || !hash) return;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 300);
    return () => clearTimeout(t);
  }, [tier, hash]);
  return null;
}

export default function Home() {
  return (
    <ExperienceProvider>
      <Controller />
      <HashSync />
      <Nav />
      <SceneLayer />
      <main id="main" className="on-dark relative z-10">
        <Hero />
        <Send />
        <Journey />
        <Arrived />
        <Network />
        <Dashboard />
        <Trust />
        <DevelopersStrip />
        <HowItsMade />
      </main>
      <Footer />
    </ExperienceProvider>
  );
}
