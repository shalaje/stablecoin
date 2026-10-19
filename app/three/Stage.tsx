import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { onRoute, scene } from "~/lib/sceneState";
import { Director } from "./Director";

/** One clock: the GSAP ticker (Lenis, ScrollTrigger, counters) also advances every R3F frame. */
function TickerDriver({ active }: { active: boolean }) {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!active) return;
    const tick = (time: number) => {
      scene.time = time;
      advance(time * 1000);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [active, advance]);
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 3) onReady();
  });
  return null;
}

export default function Stage({ lite, active, onReady }: { lite: boolean; active: boolean; onReady: () => void }) {
  const [route, setRoute] = useState({ from: scene.send.from, to: scene.send.to });
  useEffect(() => onRoute((r) => setRoute(r)), []);
  return (
    <Canvas
      aria-hidden
      frameloop="never"
      dpr={lite ? [1, 1.75] : [1, 2]}
      // antialiasing off on phones: points and thin lines don't need it, and it saves fill rate
      gl={{ antialias: !lite, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 34, near: 0.05, far: 40, position: [0, 0.42, 3.4] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <color attach="background" args={["#0A0F1E"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <TickerDriver active={active} />
      <Ready onReady={onReady} />
      <Director phone={lite} route={route} />
    </Canvas>
  );
}
