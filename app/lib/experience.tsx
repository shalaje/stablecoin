import { createContext, useContext, useEffect, useState } from "react";
import { detectTier, type Tier } from "./device";
import { registerGsap, startLenis, stopLenis } from "./scroll";
import { scene } from "./sceneState";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Ctx = createContext<Tier>("pending");
export const useTier = () => useContext(Ctx);

/**
 * Decides the experience tier after hydration (the pre-rendered HTML is the poster version),
 * starts Lenis on desktop and wires the cursor tilt.
 */
export function ExperienceProvider({ children, smooth = true }: { children: React.ReactNode; smooth?: boolean }) {
  const [tier, setTier] = useState<Tier>("pending");

  useEffect(() => {
    registerGsap();
    const t = detectTier();
    setTier(t);
    const q = new URLSearchParams(location.search);
    const shot = q.get("shot");
    if (shot) {
      scene.shot = shot as typeof scene.shot;
      document.documentElement.classList.add("capture");
    }
    scene.tilt = t === "full";
    scene.still = t === "still";
    const phoneMq = window.matchMedia("(max-width: 1023px)");
    const setPhone = () => (scene.phone = phoneMq.matches);
    setPhone();
    phoneMq.addEventListener("change", setPhone);
    // native touch scrolling on phones; the address bar must not jolt the speaker
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (t === "full" && smooth && !shot) startLenis();
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scene.px = (e.clientX / innerWidth) * 2 - 1;
      scene.py = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      stopLenis();
    };
  }, [smooth]);

  return <Ctx.Provider value={tier}>{children}</Ctx.Provider>;
}
