"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeRng, pointer, quality, scroll, damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { SNOISE3, LIGHTING } from "../shared/glsl";

/* Reused every frame; module scope keeps mutable scratch out of React. */
const _dummy = new THREE.Object3D();

/**
 * World 05 — Orbit.
 *
 * A body, a ring of debris, and a deep field. Three draw calls: the stars
 * are one point cloud, the debris is one instanced mesh, and the body is a
 * single sphere with its surface generated in the fragment stage — no
 * texture, nothing to download.
 */

/* -- Deep field --------------------------------------------------------- */

export const STAR_VERT = /* glsl */ `
uniform float uTime;
attribute float aScale;
attribute float aTwinkle;
varying float vA;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float depth = -mv.z;
  // Twinkle is per-star and out of phase, so the field never pulses.
  vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * aTwinkle + aScale * 40.0)))
     * smoothstep(150.0, 30.0, depth);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * (46.0 / max(depth, 1.0));
}`;

export const STAR_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
varying float vA;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d2 = dot(uv, uv);
  if (d2 > 0.25) discard;
  float core = smoothstep(0.25, 0.0, d2);
  vec3 col = mix(vec3(0.85, 0.87, 1.0), uAccent, 0.25);
  gl_FragColor = vec4(col, pow(core, 2.4) * vA);
}`;

function Field({ accent }: { accent: THREE.Color }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = quality.tier === "low" ? 900 : quality.tier === "mid" ? 1900 : 3200;

  const { positions, scales, twinkles } = useMemo(() => {
    const rnd = makeRng(0x2f81d4);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const twinkles = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Hollow shell: nothing spawns near the camera, which would strobe
      // past the near plane.
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 34 + Math.pow(rnd(), 0.4) * 62;
      positions[i * 3] = Math.sin(b) * Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(b) * Math.sin(a) * r * 0.75;
      positions[i * 3 + 2] = Math.cos(b) * r - 20;
      scales[i] = 0.35 + Math.pow(rnd(), 3.0) * 2.6;
      twinkles[i] = 0.4 + rnd() * 2.2;
    }
    return { positions, scales, twinkles };
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAccent: { value: accent } }),
    [accent],
  );

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" args={[twinkles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -- The body ----------------------------------------------------------- */

export const BODY_VERT = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPos = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const BODY_FRAG = /* glsl */ `
precision highp float;
${SNOISE3}
${LIGHTING}

uniform vec3  uAccent;
uniform vec3  uDeep;
uniform float uTime;

varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);

  // Banded surface: two octaves of noise quantised into strata, which
  // reads as geology far better than smooth noise does.
  float n = snoise3(vPos * 1.7 + vec3(0.0, uTime * 0.015, 0.0)) * 0.6
          + snoise3(vPos * 4.1) * 0.25;
  float bands = floor((n * 0.5 + 0.5) * 7.0) / 7.0;

  vec3 base = mix(uDeep, uAccent * 0.65, bands);
  vec3 col = studio(N, V, base, uAccent, 3.0, 26.0);

  // Terminator glow: a thin warm edge where the lit side falls away.
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.4);
  col += uAccent * rim * 0.7;

  gl_FragColor = vec4(col, 1.0);
}`;

function Body({ accent }: { accent: THREE.Color }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const deep = useMemo(() => new THREE.Color("#0d0d10"), []);
  const detail = quality.tier === "low" ? 3 : quality.tier === "mid" ? 4 : 5;

  const uniforms = useMemo(
    () => ({
      uAccent: { value: accent },
      uDeep: { value: deep },
      uTime: { value: 0 },
    }),
    [accent, deep],
  );

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime;
    if (mat.current) mat.current.uniforms.uTime.value = time;
    if (mesh.current) {
      mesh.current.rotation.y += dt * 0.055;
      mesh.current.rotation.x = 0.28;
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[3.1, detail]} />
      <shaderMaterial
        ref={mat}
        vertexShader={BODY_VERT}
        fragmentShader={BODY_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* -- Debris ring -------------------------------------------------------- */

function Ring({ accent }: { accent: THREE.Color }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = quality.tier === "low" ? 60 : quality.tier === "mid" ? 130 : 220;

  const rocks = useMemo(() => {
    const rnd = makeRng(0x8d2a55);
    return Array.from({ length: count }, () => ({
      a: rnd() * Math.PI * 2,
      r: 4.6 + Math.pow(rnd(), 0.7) * 2.9,
      y: (rnd() - 0.5) * 0.5,
      speed: 0.05 + rnd() * 0.07,
      scale: 0.04 + Math.pow(rnd(), 2.4) * 0.24,
      spin: (rnd() - 0.5) * 1.4,
    }));
  }, [count]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < rocks.length; i++) {
      const o = rocks[i];
      const a = o.a + t * o.speed;
      _dummy.position.set(Math.cos(a) * o.r, o.y, Math.sin(a) * o.r);
      _dummy.rotation.set(a * o.spin, a * 0.8, 0);
      _dummy.scale.setScalar(o.scale);
      _dummy.updateMatrix();
      m.setMatrixAt(i, _dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.35}
        roughness={0.6}
        metalness={0.2}
        flatShading
      />
    </instancedMesh>
  );
}

export default function Orbit() {
  const group = useRef<THREE.Group>(null);
  const accent = useMemo(() => new THREE.Color(WORLDS.orbit.accent), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    g.rotation.y = damp(g.rotation.y, pointer.sx * 0.28, 2.5, d);
    g.rotation.x = damp(g.rotation.x, -pointer.sy * 0.18 + 0.12, 2.5, d);
    g.position.y = damp(g.position.y, scroll.progress * 5.5 - 0.5, 3.5, d);
    g.position.x = 3.2;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[8, 5, 6]} intensity={1.6} />
      <Field accent={accent} />
      <group ref={group}>
        <Body accent={accent} />
        <group rotation={[0.34, 0, 0.16]}>
          <Ring accent={accent} />
        </group>
      </group>
    </>
  );
}
