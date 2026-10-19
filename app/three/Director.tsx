import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { arcLift, arcPoint, BERLIN, CITIES, LAGOS, vec } from "~/lib/geo";
import { journeyProgress, keys, segment, type Shot } from "~/lib/keys";
import { JOURNEY, money, quote, usdc } from "~/lib/money";
import { lerp, overlay, range, scene, smooth } from "~/lib/sceneState";
import { arcU, HeroArc, NetworkArcs, PreviewArc, preview, Streaks } from "./Arcs";
import { Globe, globeU } from "./Globe";
import { LAYER_H, Layers, layerState, Ring } from "./Layers";

type V = [number, number, number];
const L = vec(LAGOS.lat, LAGOS.lon);
const B = vec(BERLIN.lat, BERLIN.lon);
const LIFT = arcLift(L, B);
const J = quote(JOURNEY.amount, JOURNEY.from, JOURNEY.to);

const v3 = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

type Pose = { pos: THREE.Vector3; target: THREE.Vector3; sx: number; sy: number };
const mk = (): Pose => ({ pos: new THREE.Vector3(), target: new THREE.Vector3(), sx: 0, sy: 0 });

/** Journey phases inside the pinned section (0–1). */
const LAYERS_END = 0.34;
const ARC_START = 0.36;
const ARC_END = 0.9;

export function Director({ phone, route }: { phone: boolean; route: { from: string; to: string } }) {
  const globe = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  // framing follows the screen; geometry budgets follow the device tier
  const narrow = phone || size.width < 1024;
  const st = useRef({ first: true, last: -1, sx: 0, sy: 0, tiltX: 0, tiltY: 0, landT: -1, chipText: "", chipState: "" });
  const P = useMemo(() => ({ a: mk(), b: mk(), j: [mk(), mk(), mk()], out: mk() }), []);
  const pulse = useMemo(() => ({ s: 1, o: 0 }), []);
  const pinA = useMemo(() => ({ s: 1, o: 0 }), []);
  const pinB = useMemo(() => ({ s: 1, o: 0 }), []);
  const lookAt = useRef(new THREE.Vector3());
  const sendA = useMemo(() => {
    const c = CITIES.find((x) => x.id === route.from)!;
    return vec(c.lat, c.lon);
  }, [route.from]);
  const sendB = useMemo(() => {
    const c = CITIES.find((x) => x.id === route.to)!;
    return vec(c.lat, c.lon);
  }, [route.to]);

  const local = (a: V | THREE.Vector3, out: THREE.Vector3) => {
    out.copy(a as THREE.Vector3);
    if (Array.isArray(a)) out.set(a[0], a[1], a[2]);
    return globe.current ? globe.current.localToWorld(out) : out;
  };

  /** World-space camera for each named shot. */
  function shotPose(name: Shot, out: Pose, jp = 0) {
    const g = globe.current!;
    const wide = !narrow;
    switch (name) {
      case "hero":
        out.pos.set(0, 0.42, narrow ? 2.8 : 3.4);
        out.target.set(0, 0.05, 0);
        out.sx = wide ? 0.24 : 0;
        out.sy = wide ? 0 : -0.27;
        return out;
      case "send": {
        const mid = tmp.set(...sendA).add(tmp2.set(...sendB)).normalize();
        local(mid.clone().multiplyScalar(narrow ? 2.8 : 3.0).add(new THREE.Vector3(0, 0.25, 0)), out.pos);
        local(new THREE.Vector3(0, 0, 0), out.target);
        out.sx = wide ? 0.22 : 0;
        out.sy = wide ? 0 : -0.27;
        return out;
      }
      case "journey":
        return journeyPose(jp, out);
      case "land": {
        const n = v3(B);
        local(n.clone().multiplyScalar(2.2).add(new THREE.Vector3(0.0, -0.35, 0.55)), out.pos);
        local(n, out.target);
        out.sx = 0;
        out.sy = wide ? 0 : -0.2;
        return out;
      }
      case "pullback": {
        const n = v3(B).add(v3(L)).normalize();
        local(n.multiplyScalar(4.2).add(new THREE.Vector3(0, 0.2, 0)), out.pos);
        local(new THREE.Vector3(0, 0, 0), out.target);
        out.sx = 0;
        out.sy = wide ? 0.04 : -0.18;
        return out;
      }
      case "horizon":
        out.pos.set(0, 1.24, narrow ? 1.9 : 1.55);
        out.target.set(0, 1.62, -1.6);
        out.sx = 0;
        out.sy = 0;
        return out;
      case "line":
        out.pos.set(0, 1.1, 1.25);
        out.target.set(0, 1.5, -2.2);
        out.sx = 0;
        out.sy = 0;
        return out;
    }
    void g;
    return out;
  }

  /** The camera spline through the journey: above Lagos → behind the arc → over Berlin. */
  function journeyPose(p: number, out: Pose) {
    const [layers, arc, land] = P.j;
    // 1 · hovering 0.6 radii above Lagos, looking down through the glass layers
    const n = v3(L);
    const south = tmp.copy(UP).cross(n).cross(n).normalize(); // tangent pointing south
    local(n.clone().multiplyScalar(narrow ? 2.3 : 1.95).addScaledVector(south, narrow ? 0.7 : 0.6), layers.pos);
    local(n.clone().multiplyScalar(1.13), layers.target);
    layers.sx = narrow ? 0 : 0.2;
    layers.sy = narrow ? -0.24 : -0.12;
    // 2 · tail camera behind and above the arc's tip
    const a = range(p, ARC_START, ARC_END);
    const ae = a;
    const tip = v3(arcPoint(L, B, ae, LIFT));
    const back = v3(arcPoint(L, B, Math.max(0, ae - 0.3), LIFT));
    const outward = back.clone().normalize();
    // a little to the side of the route, so the arc reads as a curve, not a beam
    const side = outward.clone().cross(tip.clone().sub(back)).normalize();
    local(back.clone().addScaledVector(outward, narrow ? 1.45 : 1.0).addScaledVector(side, narrow ? 0.35 : 0.55), arc.pos);
    local(tip.clone().lerp(v3(B), 0.35), arc.target);
    arc.sx = narrow ? 0 : 0.14;
    arc.sy = narrow ? -0.22 : 0;
    // 3 · settling over Berlin
    shotPose("land", land);
    const w1 = smooth(range(p, LAYERS_END - 0.04, ARC_START + 0.06));
    const w2 = smooth(range(p, ARC_END - 0.06, 1));
    out.pos.copy(layers.pos).lerp(arc.pos, w1).lerp(land.pos, w2);
    out.target.copy(layers.target).lerp(arc.target, w1).lerp(land.target, w2);
    out.sx = lerp(lerp(layers.sx, arc.sx, w1), land.sx, w2);
    out.sy = lerp(lerp(layers.sy, arc.sy, w1), land.sy, w2);
    return out;
  }

  useFrame(() => {
    const g = globe.current;
    if (!g) return;
    const S = st.current;
    const now = scene.time;
    const dt = S.last < 0 ? 1 / 60 : Math.min(0.05, now - S.last);
    S.last = now;

    const seg = segment(scene.scrollY);
    const jp = scene.shot === "journey" ? 0.6 : scene.shot === "layers" ? 0.2 : journeyProgress(scene.scrollY);
    const t = seg ? smooth(seg.t) : 0;
    const vals = seg
      ? { dim: lerp(seg.a.dim, seg.b.dim, t), rate: lerp(seg.a.rate, seg.b.rate, t), spin: lerp(seg.a.spin, seg.b.spin, t) }
      : { dim: 1, rate: 0.02, spin: 1 };
    if (scene.shot === "network") (vals.rate = 1), (vals.spin = 0);

    // the globe barely moves: one slow idle turn a minute, only where the camera isn't riding it
    if (!scene.still) g.rotation.y += dt * vals.spin * ((Math.PI * 2) / 60);

    // ── camera ──────────────────────────────────────────────────────────────
    const out = P.out;
    if (scene.shot) {
      const map: Record<string, Shot> = { hero: "hero", journey: "journey", layers: "journey", land: "land", network: "pullback", horizon: "horizon" };
      if (scene.shot === "cover") {
        const mid = v3(L).add(v3(B)).normalize();
        local(mid.clone().multiplyScalar(3.1).add(new THREE.Vector3(0.35, 0.1, 0)), out.pos);
        local(mid.clone().multiplyScalar(0.55), out.target);
        out.sx = 0.18;
        out.sy = 0;
      } else shotPose(map[scene.shot] ?? "hero", out, jp);
    } else if (seg && seg.a.shot === "journey" && seg.b.shot === "land") journeyPose(jp, out);
    else if (seg) {
      shotPose(seg.a.shot, P.a, seg.a.shot === "journey" ? 0 : 1);
      shotPose(seg.b.shot, P.b, seg.b.shot === "journey" ? 0 : 1);
      out.pos.copy(P.a.pos).lerp(P.b.pos, t);
      out.target.copy(P.a.target).lerp(P.b.target, t);
      out.sx = lerp(P.a.sx, P.b.sx, t);
      out.sy = lerp(P.a.sy, P.b.sy, t);
    } else shotPose("hero", out);

    // cursor tilt, hero only
    const heroW = seg && seg.a.shot === "hero" ? 1 - seg.t : 0;
    const tilt = scene.tilt && !scene.still ? heroW : 0;
    S.tiltX += (scene.px * 0.18 * tilt - S.tiltX) * Math.min(1, dt * 3);
    S.tiltY += (-scene.py * 0.12 * tilt - S.tiltY) * Math.min(1, dt * 3);
    out.pos.x += S.tiltX;
    out.pos.y += S.tiltY;

    const damp = S.first || scene.shot ? 1 : 1 - Math.exp(-dt * 6);
    camera.position.lerp(out.pos, damp);
    lookAt.current.lerp(out.target, damp);
    camera.lookAt(lookAt.current);
    S.sx += (out.sx - S.sx) * damp;
    S.sy += (out.sy - S.sy) * damp;
    S.first = false;
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, -S.sx * size.width, S.sy * size.height, size.width, size.height);

    // ── globe + arcs ────────────────────────────────────────────────────────
    globeU.uDim.value = vals.dim;
    globeU.uFill.value = scene.fill;
    arcU.uRate.value = vals.rate;
    if (!scene.still) arcU.uNetTime.value += dt * (0.6 + vals.rate * 0.9);
    const inJourney = jp > 0 && jp < 1 ? 1 : 0;
    const afterJourney = seg && (seg.a.key === "journey" || seg.a.key === "arrived") && jp >= 1 ? 1 : 0;
    const loaderVis = keys.list.length && scene.scrollY < 10 ? 1 - range(scene.fill, 0.7, 1) : 0;
    const arcA = range(jp, ARC_START, ARC_END);
    arcU.uProgress.value = scene.shot === "cover" ? 1 : scene.shot === "journey" ? 0.6 : inJourney || afterJourney ? arcA : scene.loader;
    arcU.uOpacity.value = scene.shot === "journey" || scene.shot === "cover" ? 1 : Math.max(loaderVis, inJourney ? smooth(range(jp, ARC_START - 0.02, ARC_START + 0.02)) : 0, afterJourney);
    arcU.uArrived.value = scene.shot === "cover" ? 1 : range(jp, ARC_END - 0.01, ARC_END + 0.03);
    globeU.uHot.value = inJourney || afterJourney ? 1 : 0.6;

    // layers above Lagos
    const chipH = 0.02 + 0.4 * smooth(range(jp, 0.04, LAYERS_END));
    layerState.show = scene.shot === "layers" ? 1 : smooth(range(jp, 0.0, 0.05)) * (1 - smooth(range(jp, ARC_START, ARC_START + 0.08)));
    LAYER_H.forEach((h, i) => (layerState.lit[i] = smooth(range(chipH, h - 0.02, h + 0.03))));

    // Berlin pulses once on landing; send pins
    const land = range(jp, ARC_END, ARC_END + 0.06);
    pulse.s = 1 + land * 5;
    pulse.o = land > 0 && land < 1 ? (1 - land) * 0.9 : 0;
    const sendVis = seg && seg.a.key === "send" ? 1 : seg && seg.b.key === "send" ? seg.t : 0;
    pinA.o = pinB.o = sendVis * (0.7 + 0.3 * Math.sin(now * 3));
    preview.opacity = sendVis;

    // ── payment chip: HTML text placed on the 3D point every frame ──────────
    let chipPt: THREE.Vector3 | null = null;
    let text = money(JOURNEY.amount, "NGN", 0);
    let state = "Ready in Lagos";
    let alpha = 0;
    if (seg?.a.key === "hero" || scene.shot === "hero") {
      chipPt = local(v3(L).multiplyScalar(1.01), tmp);
      alpha = (1 - (seg?.t ?? 0)) * range(scene.fill, 0.6, 1);
    } else if (sendVis > 0 && !inJourney) {
      chipPt = local(v3(sendA).multiplyScalar(1.01), tmp);
      text = scene.send.amount;
      state = "Ready to send";
      alpha = sendVis;
    } else if (inJourney || afterJourney || scene.shot === "journey") {
      const aa = scene.shot === "journey" ? 0.6 : arcA;
      if (jp < ARC_START && scene.shot !== "journey") chipPt = local(v3(L).multiplyScalar(1 + chipH), tmp);
      else chipPt = local(v3(arcPoint(L, B, aa, LIFT)), tmp);
      const converted = layerState.lit[0] > 0.5;
      text = converted ? usdc(J.usdc) : money(JOURNEY.amount, "NGN", 0);
      state = jp < 0.06 ? "Leaving Lagos" : layerState.lit[2] > 0.5 ? "In flight" : layerState.lit[1] > 0.5 ? "Settling on-chain" : converted ? "Converted" : "Converting";
      if (arcU.uArrived.value > 0.5) (text = money(J.received, "EUR")), (state = "Arrived in Berlin");
      alpha = 1;
    }
    const el = overlay.chip;
    if (el) {
      if (chipPt && alpha > 0.01) {
        chipPt.project(camera);
        const x = (chipPt.x * 0.5 + 0.5) * size.width;
        const y = (-chipPt.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = alpha.toFixed(3);
        if (text !== S.chipText && overlay.chipAmount) overlay.chipAmount.textContent = S.chipText = text;
        if (state !== S.chipState && overlay.chipState) overlay.chipState.textContent = S.chipState = state;
        el.classList.toggle("is-arrived", arcU.uArrived.value > 0.5 && jp > 0);
      } else el.style.opacity = "0";
    }
    // journey timer: 0.0 → 4.2 s along the arc, rewinds with the scroll
    const secs = (JOURNEY.seconds * arcA).toFixed(1);
    overlay.timer.forEach((t) => t && t.textContent !== `${secs} s` && (t.textContent = `${secs} s`));

    // layer labels
    overlay.layerLabels.forEach((lb, i) => {
      if (!lb) return;
      if (layerState.show < 0.02) {
        lb.style.opacity = "0";
        return;
      }
      const p = local(v3(L).multiplyScalar(1 + LAYER_H[i]).add(new THREE.Vector3(0, 0, 0)), tmp2).project(camera);
      lb.style.transform = `translate3d(${((p.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-p.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0)`;
      lb.style.opacity = layerState.show.toFixed(3);
      lb.classList.toggle("is-lit", layerState.lit[i] > 0.5);
    });
  });

  return (
    <group ref={globe} rotation={[0.22, -0.18, 0]}>
      <Globe phone={phone} />
      <NetworkArcs count={phone ? 80 : 320} />
      {!phone && <Streaks count={160} />}
      <HeroArc a={L} b={B} />
      <PreviewArc a={sendA} b={sendB} />
      <Layers phone={phone} />
      <Ring at={B} state={pulse} />
      <Ring at={sendA} state={pinA} />
      <Ring at={sendB} state={pinB} />
    </group>
  );
}
