"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll, pointer, quality, damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { SNOISE2 } from "../shared/glsl";

/**
 * World 02 — Lattice.
 *
 * A wireframe terrain travelling toward you, driven by scroll. The whole
 * surface is displaced in the vertex shader from a scroll offset, so
 * flying thirty units of landscape costs one uniform write and one draw
 * call; nothing is rebuilt on the CPU.
 *
 * A second pass draws points at the same vertices with additive blending,
 * which gives the intersections a spark without a bloom pass.
 */

export const LATTICE_VERT = /* glsl */ `
${SNOISE2}

uniform float uTravel;
uniform float uTime;
uniform vec2  uPointer;

varying float vHeight;
varying float vFade;
varying vec2  vGrid;

float terrain(vec2 p) {
  float h = fbm2(p * 0.09, 4) * 2.4;
  // A ridge running down the middle keeps the horizon from reading flat.
  h += exp(-p.x * p.x * 0.006) * 1.1;
  return h;
}

void main() {
  vec3 p = position;

  // Scroll slides the sample window rather than the mesh, so the terrain
  // is endless and the geometry never moves.
  vec2 samplePos = vec2(p.x, p.y + uTravel);
  float h = terrain(samplePos);

  // The pointer lifts a soft bulge out of the surface.
  float pd = distance(p.xy, uPointer);
  h += exp(-pd * pd * 0.03) * 1.5;

  p.z = h;

  vHeight = h;
  vGrid = samplePos;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // Fade both the far edge and the very near rows, so the mesh has no
  // visible boundary in either direction.
  float dist = -mv.z;
  vFade = smoothstep(78.0, 34.0, dist) * smoothstep(2.0, 12.0, dist);

  gl_Position = projectionMatrix * mv;
  gl_PointSize = 2.4;
}`;

export const LATTICE_FRAG_LINES = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
varying float vHeight;
varying float vFade;

void main() {
  // Height maps to brightness: peaks catch the accent, troughs sink to a
  // near-black blue so the relief reads without any lighting at all.
  float lift = smoothstep(-1.2, 2.6, vHeight);
  vec3 low  = vec3(0.11);
  vec3 col  = mix(low, uAccent, pow(lift, 1.5));
  gl_FragColor = vec4(col, vFade * (0.22 + lift * 0.55));
}`;

export const LATTICE_FRAG_POINTS = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
varying float vHeight;
varying float vFade;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  if (dot(uv, uv) > 0.25) discard;
  float lift = smoothstep(0.2, 2.8, vHeight);
  gl_FragColor = vec4(uAccent * (0.5 + lift), vFade * lift * 0.9);
}`;

export default function Lattice() {
  const lines = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);

  const accent = useMemo(() => new THREE.Color(WORLDS.lattice.accent), []);

  const segments = quality.tier === "low" ? 48 : quality.tier === "mid" ? 72 : 100;

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(90, 90, segments, segments),
    [segments],
  );

  // Two separate uniform sets: the lines and the points are different
  // materials and must not share mutable uniform objects.
  const lineUniforms = useMemo(
    () => ({
      uTravel: { value: 0 },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: accent },
    }),
    [accent],
  );

  const pointUniforms = useMemo(
    () => ({
      uTravel: { value: 0 },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: accent },
    }),
    [accent],
  );

  const travel = useRef(0);
  const px = useRef(0);
  const py = useRef(0);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const time = state.clock.elapsedTime;

    // Constant drift plus scroll. The drift means the world is alive even
    // when the page is still.
    travel.current += d * 1.6 + scroll.velocity * 0.06;

    px.current = damp(px.current, pointer.sx * 16, 4, d);
    py.current = damp(py.current, -pointer.sy * 8, 4, d);

    for (const m of [lines.current, points.current]) {
      if (!m) continue;
      m.uniforms.uTravel.value = travel.current;
      m.uniforms.uTime.value = time;
      m.uniforms.uPointer.value.set(px.current, py.current);
    }

    if (group.current) {
      // Tilt the plate away from the camera into a horizon.
      group.current.rotation.x = -1.06 + pointer.sy * 0.03;
      group.current.rotation.z = damp(group.current.rotation.z, pointer.sx * 0.06, 3, d);
      group.current.position.y = -5.2;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={lines}
          vertexShader={LATTICE_VERT}
          fragmentShader={LATTICE_FRAG_LINES}
          uniforms={lineUniforms}
          wireframe
          transparent
          depthWrite={false}
        />
      </mesh>

      <points geometry={geometry}>
        <shaderMaterial
          ref={points}
          vertexShader={LATTICE_VERT}
          fragmentShader={LATTICE_FRAG_POINTS}
          uniforms={pointUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
