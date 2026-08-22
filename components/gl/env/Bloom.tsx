"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeRng, pointer, quality, scroll } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { SNOISE3 } from "../shared/glsl";
import { usePointerPlane } from "../shared/usePointerPlane";

/**
 * World 04 — Bloom.
 *
 * Thousands of small lights drifting on a noise field, with the pointer as
 * an attractor. Every particle is animated in the vertex stage from a time
 * uniform and an attractor position, so the CPU cost of the entire swarm
 * is two uniform writes per frame and the whole world is one draw call.
 *
 * That is the difference between this being free and being the reason a
 * laptop gets loud.
 */

export const BLOOM_VERT = /* glsl */ `
${SNOISE3}

uniform float uTime;
uniform vec3  uAttractor;
uniform float uPull;
uniform float uScroll;

attribute float aSeed;
attribute float aScale;

varying float vGlow;
varying float vSeed;

void main() {
  vec3 p = position;

  // Slow organic drift. Three noise samples rather than a full curl solve:
  // at this scale the difference is invisible and it costs a third as much.
  float t = uTime * 0.06 + aSeed * 6.28;
  vec3 flow = vec3(
    snoise3(p * 0.09 + vec3(t, 0.0, 0.0)),
    snoise3(p * 0.09 + vec3(0.0, t, 11.3)),
    snoise3(p * 0.09 + vec3(4.7, 0.0, t))
  ) * 2.2;

  p += flow;
  p.y += uScroll * 6.0;

  // Attraction toward the pointer, strongest at mid range so particles
  // orbit it instead of collapsing onto a single point.
  vec3 toward = uAttractor - p;
  float dist = length(toward);
  float band = exp(-dist * dist * 0.006) * (1.0 - exp(-dist * 0.35));
  p += normalize(toward + 1e-5) * band * uPull * 3.2;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;

  vGlow = smoothstep(60.0, 8.0, depth) * (0.35 + band * 2.6);
  vSeed = aSeed;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * (34.0 / max(depth, 1.0)) * (1.0 + band * 1.8);
}`;

export const BLOOM_FRAG = /* glsl */ `
precision mediump float;

uniform vec3 uAccent;
uniform vec3 uCool;

varying float vGlow;
varying float vSeed;

void main() {
  // Soft round sprite from a radial falloff. Cheaper than a texture fetch
  // and it gives a cleaner core.
  vec2 uv = gl_PointCoord - 0.5;
  float d2 = dot(uv, uv);
  if (d2 > 0.25) discard;

  float core = smoothstep(0.25, 0.0, d2);
  float halo = pow(core, 3.0);

  vec3 col = mix(uCool, uAccent, smoothstep(0.35, 0.95, vSeed));
  // Held well down: this sits behind body copy, and additive blending
  // over black climbs fast.
  float a = (halo * 0.55 + core * 0.07) * vGlow;

  gl_FragColor = vec4(col * (0.6 + halo * 1.5), a);
}`;

export default function Bloom() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const readPointer = usePointerPlane(0);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const accent = useMemo(() => new THREE.Color(WORLDS.bloom.accent), []);
  const cool = useMemo(() => new THREE.Color("#8a8a92"), []);

  const count =
    quality.tier === "low" ? 900 : quality.tier === "mid" ? 1800 : 3000;

  const { positions, seeds, scales } = useMemo(() => {
    const rnd = makeRng(0x7bc10e);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // A flattened shell, so the swarm reads as a cloud in front of the
      // camera rather than a solid ball of points.
      const a = rnd() * Math.PI * 2;
      const r = 3 + Math.pow(rnd(), 0.55) * 17;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r * 0.62;
      positions[i * 3 + 2] = (rnd() - 0.5) * 22 - 4;

      seeds[i] = rnd();
      // Weighted small: a few bright motes read far better than an even
      // haze of medium ones.
      scales[i] = 0.5 + Math.pow(rnd(), 3.4) * 5.5;
    }
    return { positions, seeds, scales };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAttractor: { value: new THREE.Vector3(0, 0, 0) },
      uPull: { value: 0 },
      uScroll: { value: 0 },
      uAccent: { value: accent },
      uCool: { value: cool },
    }),
    [accent, cool],
  );

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    readPointer(hit);
    u.uTime.value = state.clock.elapsedTime;
    u.uAttractor.value.copy(hit);
    // Pull eases in once the pointer has actually moved, so the swarm is
    // calm until you touch it.
    u.uPull.value = Math.min(1, pointer.speed * 0.05 + 0.35);
    u.uScroll.value = scroll.progress;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={BLOOM_VERT}
        fragmentShader={BLOOM_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
