import type { Route } from "./+types/not-found";
import { pageMeta } from "~/lib/site";
import { ExperienceProvider } from "~/lib/experience";
import { Nav } from "~/components/Nav";
import { Button } from "~/components/ui/Button";

export const meta: Route.MetaFunction = () => [...pageMeta("Page not found · Arcway (concept)", "This route has no destination.", "/404"), { name: "robots", content: "noindex" }];

export default function NotFound() {
  return (
    <ExperienceProvider smooth={false}>
      <Nav />
      <main id="main" className="site flex min-h-[100svh] flex-col justify-center pt-20">
        <p className="text-label text-mist">404 · no destination</p>
        <h1 className="text-display mt-4 max-w-[12ch]">This payment never left.</h1>
        <div className="mt-10 flex gap-3"><Button to="/" arrow>Back to Arcway</Button><Button to="/developers" variant="secondary">Developers</Button></div>
      </main>
    </ExperienceProvider>
  );
}
