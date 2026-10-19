import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { LAGOS, vec } from "~/lib/geo";
import { globeU } from "./Globe";

export const LAYER_NAMES = ["Convert", "Settle", "Pay out"];
export const LAYER_H = [0.13, 0.24, 0.35]; // height above the surface, in globe radii

/** 0–1 per layer: how lit each glass plane is (written by the Director). */
export const layerState = { lit: [0, 0, 0], show: 0 };

/**
 * Three thin glass planes stacked above Lagos: Convert, Settle, Pay out. Desktop uses real
 * transmission (refracts the dots below); phones get a cheaper frosted plane.
 */
export function Layers({ phone }: { phone: boolean }) {
  const n = useMemo(() => new THREE.Vector3(...vec(LAGOS.lat, LAGOS.lon)), []);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), [n]);
  const mats = useMemo(
    () =>
      LAYER_H.map(() =>
        phone
          ? new THREE.MeshBasicMaterial({ color: "#C9D2FF", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
          : new THREE.MeshPhysicalMaterial({
              color: "#DDE3FF",
              transmission: 1,
              thickness: 0.02,
              roughness: 0.18,
              metalness: 0,
              ior: 1.3,
              transparent: true,
              opacity: 0,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
      ),
    [phone],
  );
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.34, 0.22)), []);
  const edgeMats = useMemo(() => LAYER_H.map(() => new THREE.LineBasicMaterial({ color: "#6F84FF", transparent: true, opacity: 0 })), []);

  useFrame(() => {
    const show = layerState.show * globeU.uFill.value;
    mats.forEach((m, i) => {
      m.opacity = show * (phone ? 0.16 + layerState.lit[i] * 0.2 : 0.55 + layerState.lit[i] * 0.3);
    });
    edgeMats.forEach((m, i) => {
      m.opacity = show * (0.35 + layerState.lit[i] * 0.65);
      m.color.set(layerState.lit[i] > 0.5 ? "#3FE0B0" : "#6F84FF");
    });
  });

  return (
    <group>
      {LAYER_H.map((h, i) => (
        <group key={h} position={n.clone().multiplyScalar(1 + h)} quaternion={q}>
          <mesh material={mats[i]} renderOrder={5}>
            <planeGeometry args={[0.34, 0.22]} />
          </mesh>
          <lineSegments geometry={edgeGeo} material={edgeMats[i]} renderOrder={6} />
        </group>
      ))}
    </group>
  );
}

/** Pulsing ring on a city (send pins, the Berlin landing pulse). */
export function Ring({ at, state }: { at: [number, number, number]; state: { s: number; o: number } }) {
  const n = useMemo(() => new THREE.Vector3(...at), [at]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), [n]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#3FE0B0", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const ref = useMemo(() => ({ m: null as THREE.Mesh | null }), []);
  useFrame(() => {
    mat.opacity = state.o * globeU.uFill.value;
    if (ref.m) ref.m.scale.setScalar(state.s);
  });
  return (
    <mesh ref={(m) => void (ref.m = m)} position={n.clone().multiplyScalar(1.003)} quaternion={q} material={mat}>
      <ringGeometry args={[0.02, 0.026, 48]} />
    </mesh>
  );
}
