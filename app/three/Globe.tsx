import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vec } from "~/lib/geo";
import { scene } from "~/lib/sceneState";

/** Uniforms every globe material shares (dim, active cities), written by the Director. */
export const globeU = {
  uTime: { value: 0 },
  uDim: { value: 1 },
  uFill: { value: 0 },
  uCityA: { value: new THREE.Vector3(...vec(6.52, 3.38)) },
  uCityB: { value: new THREE.Vector3(...vec(52.52, 13.4)) },
  uHot: { value: 1 },
};

/** Land dots: baked Int16 lat/lon pairs → unit vectors, one Points draw call. */
function useDots(phone: boolean) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/globe/dots-${phone ? "phone" : "desktop"}.bin`)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (!alive) return;
        const a = new Int16Array(buf);
        const n = a.length / 2;
        const pos = new Float32Array(n * 3);
        const rnd = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const v = vec(a[i * 2] / 300, a[i * 2 + 1] / 150);
          pos.set(v, i * 3);
          rnd[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
        setGeo(g);
      });
    return () => {
      alive = false;
    };
  }, [phone]);
  return geo;
}

export function Globe({ phone }: { phone: boolean }) {
  const dots = useDots(phone);

  const dotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { ...globeU, uSize: { value: phone ? 2.2 : 2.0 }, uPx: { value: Math.min(2, window.devicePixelRatio) } },
        vertexShader: /* glsl */ `
          uniform float uTime, uSize, uPx, uHot;
          uniform vec3 uCityA, uCityB;
          attribute float aRnd;
          varying float vA;
          varying float vHot;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position * 1.002, 1.0);
            // face the camera: dots on the far side fade out
            vec3 n = normalize(normalMatrix * position);
            float facing = clamp(dot(n, normalize(-mv.xyz)) * 1.6 + 0.2, 0.0, 1.0);
            float tw = 0.75 + 0.25 * sin(uTime * (0.6 + abs(aRnd) * 1.4) + aRnd * 40.0);
            float hot = max(smoothstep(0.12, 0.0, distance(position, uCityA)), smoothstep(0.12, 0.0, distance(position, uCityB))) * uHot;
            vHot = hot;
            vA = facing * tw;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * uPx * (1.0 + hot * 0.8) * (3.0 / -mv.z);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uDim, uFill;
          varying float vA;
          varying float vHot;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            vec3 mist = vec3(0.663, 0.702, 0.78);
            vec3 sig = vec3(0.45, 0.56, 1.0);
            gl_FragColor = vec4(mix(mist, sig, vHot), vA * (0.55 + vHot * 0.45) * uDim * uFill);
          }`,
        transparent: true,
        depthWrite: false,
      }),
    [phone],
  );

  const ocean = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: globeU,
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uDim, uFill;
          varying vec3 vN; varying vec3 vV;
          void main() {
            float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.0);
            vec3 deep = vec3(0.035, 0.055, 0.12);
            vec3 rim = vec3(0.18, 0.29, 1.0);
            gl_FragColor = vec4(deep + rim * f * 0.32 * uDim, uFill);
          }`,
        transparent: true,
      }),
    [],
  );

  // atmosphere: back-face shell, additive, a soft blue halo around the limb
  const atmo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: globeU,
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uDim, uFill;
          varying vec3 vN; varying vec3 vV;
          void main() {
            float f = pow(max(0.0, 0.55 - dot(vN, vV)), 3.0);
            gl_FragColor = vec4(vec3(0.2, 0.32, 1.0) * f * 0.9, f * uDim * uFill);
          }`,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    globeU.uTime.value = scene.time;
  });

  return (
    <group>
      <mesh material={ocean} renderOrder={0}>
        <sphereGeometry args={[0.995, phone ? 48 : 72, phone ? 32 : 48]} />
      </mesh>
      {!phone && (
        <mesh material={atmo} scale={1.07}>
          <sphereGeometry args={[1, 48, 32]} />
        </mesh>
      )}
      {dots && <points geometry={dots} material={dotMat} renderOrder={1} />}
    </group>
  );
}
