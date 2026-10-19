import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { arcLift, arcPoint, CITIES, HUBS, vec } from "~/lib/geo";
import { globeU } from "./Globe";

const SIGNAL = new THREE.Color("#2F4BFF");
const SIGNAL_HI = new THREE.Color("#6F84FF");
const MINT = new THREE.Color("#3FE0B0");

export const arcU = {
  uProgress: { value: 0 }, // hero arc draw, 0–1
  uArrived: { value: 0 }, // tip turns mint
  uRate: { value: 0.02 }, // share of network arcs active
  uNetTime: { value: 0 }, // network clock (pauses when the globe is quiet)
  uOpacity: { value: 1 },
};

type V = [number, number, number];

/** The payment's arc: a tube from Lagos to Berlin revealed by uProgress. */
export function heroArcGeometry(a: V, b: V) {
  const lift = arcLift(a, b);
  const pts = Array.from({ length: 96 }, (_, i) => new THREE.Vector3(...arcPoint(a, b, i / 95, lift)));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0045, 8, false);
}

export function HeroArc({ a, b }: { a: V; b: V }) {
  const geo = useMemo(() => heroArcGeometry(a, b), [a, b]);
  const halo = useMemo(() => {
    const lift = arcLift(a, b);
    const pts = Array.from({ length: 96 }, (_, i) => new THREE.Vector3(...arcPoint(a, b, i / 95, lift)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.014, 8, false);
  }, [a, b]);
  const mat = (halo: boolean) =>
    new THREE.ShaderMaterial({
      uniforms: { ...arcU, ...globeU, uHalo: { value: halo ? 1 : 0 }, uSig: { value: SIGNAL_HI }, uMint: { value: MINT } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uProgress, uArrived, uHalo, uOpacity;
        uniform vec3 uSig, uMint;
        varying vec2 vUv;
        void main() {
          float a = vUv.x;
          float drawn = 1.0 - smoothstep(uProgress - 0.004, uProgress + 0.004, a);
          float tip = smoothstep(0.08, 0.0, uProgress - a) * drawn;
          // money moving is blue; the last stretch turns mint once it has landed
          vec3 col = mix(uSig, uMint, uArrived * smoothstep(0.55, 1.0, a));
          float alpha = drawn * (0.55 + tip * 0.45);
          if (uHalo > 0.5) alpha *= 0.22;
          gl_FragColor = vec4(col * (1.0 + tip * 0.6), alpha * uOpacity);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const core = useMemo(() => mat(false), []);
  const glow = useMemo(() => mat(true), []);
  return (
    <group>
      <mesh geometry={geo} material={core} renderOrder={4} />
      <mesh geometry={halo} material={glow} renderOrder={3} />
    </group>
  );
}

/**
 * Network arcs: hundreds of great circles in ONE LineSegments draw call. Each vertex knows
 * its arc's seed and its position along the arc; the shader runs a head/tail window from a
 * shared clock, and uRate decides how many arcs are live.
 */
export function NetworkArcs({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const ends: V[] = [...CITIES.map((c) => vec(c.lat, c.lon)), ...HUBS.map(([la, lo]) => vec(la, lo))];
    const SEG = 28;
    const pos = new Float32Array(count * SEG * 2 * 3);
    const at = new Float32Array(count * SEG * 2);
    const seed = new Float32Array(count * SEG * 2);
    const idx = new Float32Array(count * SEG * 2);
    let v = 0;
    const r = (i: number) => {
      const x = Math.sin(i * 78.233 + 1.7) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      let ia = Math.floor(r(i) * ends.length);
      let ib = Math.floor(r(i + 999) * ends.length);
      if (ia === ib) ib = (ib + 3) % ends.length;
      // a third of all traffic touches Lagos or Berlin, so the story's cities stay busy
      if (i % 3 === 0) ia = i % 6 === 0 ? 0 : 1;
      const a = ends[ia],
        b = ends[ib];
      const lift = arcLift(a, b) * 0.8;
      const s = r(i + 31);
      for (let k = 0; k < SEG; k++) {
        for (const t of [k / SEG, (k + 1) / SEG]) {
          pos.set(arcPoint(a, b, t, lift), v * 3);
          at[v] = t;
          seed[v] = s;
          idx[v] = (i + 0.5) / count;
          v++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aT", new THREE.BufferAttribute(at, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...arcU, ...globeU, uSig: { value: SIGNAL_HI }, uMint: { value: MINT } },
      vertexShader: /* glsl */ `
        attribute float aT, aSeed, aIdx;
        uniform float uNetTime, uRate;
        varying float vA; varying float vTip;
        void main() {
          float speed = 0.16 + aSeed * 0.12;
          float head = fract(uNetTime * speed + aSeed * 7.0) * 1.45;
          float d = head - aT;
          float on = step(0.0, d) * (1.0 - smoothstep(0.18, 0.42, d));
          float live = step(aIdx, uRate);
          vA = on * live;
          vTip = smoothstep(0.06, 0.0, d) * step(0.0, d) * step(0.85, aT);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSig, uMint; uniform float uDim, uFill, uOpacity;
        varying float vA; varying float vTip;
        void main() {
          if (vA < 0.01) discard;
          gl_FragColor = vec4(mix(uSig, uMint, vTip), vA * 0.95 * uDim * uFill);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, mat };
  }, [count]);
  return <lineSegments geometry={geo} material={mat} renderOrder={2} />;
}

/** Streaks rising off the horizon (the network scene), one draw call. */
export function Streaks({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    const seed = new Float32Array(count * 2);
    const top = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const lat = 15 + ((Math.sin(i * 17.3) * 0.5 + 0.5) * 60);
      const lon = -40 + ((Math.sin(i * 91.7) * 0.5 + 0.5) * 110);
      const n = vec(lat, lon);
      pos.set(n, i * 6);
      pos.set(n, i * 6 + 3);
      const s = Math.sin(i * 3.1) * 0.5 + 0.5;
      seed[i * 2] = seed[i * 2 + 1] = s;
      top[i * 2] = 0;
      top[i * 2 + 1] = 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aTop", new THREE.BufferAttribute(top, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...arcU, ...globeU },
      vertexShader: /* glsl */ `
        attribute float aSeed, aTop; uniform float uNetTime;
        varying float vA;
        void main() {
          float t = fract(uNetTime * (0.12 + aSeed * 0.2) + aSeed * 9.0);
          float r = 1.0 + t * 0.35 + aTop * (0.05 + aSeed * 0.08);
          vA = 1.0 - t;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * r, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uRate, uDim, uFill; varying float vA;
        void main() { gl_FragColor = vec4(0.45, 0.56, 1.0, vA * 0.5 * smoothstep(0.2, 0.8, uRate) * uDim * uFill); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, mat };
  }, [count]);
  return <lineSegments geometry={geo} material={mat} />;
}

/** Faint dashed preview arc between the calculator's two cities. */
export const preview = { opacity: 0 };
export function PreviewArc({ a, b }: { a: V; b: V }) {
  const line = useMemo(() => {
    const lift = arcLift(a, b);
    const pts = Array.from({ length: 80 }, (_, i) => new THREE.Vector3(...arcPoint(a, b, i / 79, lift)));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineDashedMaterial({ color: "#A9B3C7", dashSize: 0.02, gapSize: 0.015, transparent: true, opacity: 0, depthWrite: false });
    const l = new THREE.Line(g, m);
    l.computeLineDistances();
    return l;
  }, [a, b]);
  useFrame(() => {
    (line.material as THREE.LineDashedMaterial).opacity = preview.opacity * 0.7 * globeU.uFill.value;
  });
  return <primitive object={line} />;
}
