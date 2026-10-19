import { Reveal } from "../ui/Reveal";

const LINES = [
  ["Stack", "React 19 · TypeScript · Vite · React Router v7 · Tailwind v4"],
  ["Globe", "17k land dots baked at build time from Natural Earth on a sunflower spiral, one draw call"],
  ["Arcs", "Great-circle maths; 320 network arcs in a single line buffer, animated in the shader"],
  ["Journey", "One scroll value drives the camera spline, the arc, the glass layers and the timer"],
  ["Chip", "Real HTML text placed over the 3D arc's tip every frame"],
  ["Clock", "GSAP ticker drives Lenis, ScrollTrigger, the 3D frame and every counter"],
  ["Weight", "Globe data under 70 KB; the 3D chunk loads after the hero text"],
];

export function HowItsMade() {
  return (
    <section id="made" aria-labelledby="made-title" className="relative section-pad">
      <div className="site grid grid-cols-12">
        <Reveal className="col-span-12 lg:col-span-6">
          <p className="text-label text-mist">How it's made</p>
          <h2 id="made-title" className="text-h3 mt-4">A live globe that's light enough for a phone.</h2>
          <ul className="mt-6 space-y-2 font-mono text-[12.5px] leading-[1.6]">
            {LINES.map(([k, v]) => (
              <li key={k} className="grid grid-cols-[76px_1fr] gap-3">
                <span className="uppercase tracking-[0.04em] text-mist">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] text-mist">Concept, copy, design and build by <span className="text-paper">Nova Digital Studio</span>.</p>
        </Reveal>
      </div>
    </section>
  );
}
