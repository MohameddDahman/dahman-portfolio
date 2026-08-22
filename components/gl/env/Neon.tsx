"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeRng, pointer, quality, scroll, damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";

/* Reused every frame; module scope keeps mutable scratch out of React. */
const _dummy = new THREE.Object3D();

/**
 * World 07 — Neon.
 *
 * A tunnel of gates falling toward you. Scroll drives the travel; the
 * gates wrap around modulo the tunnel length, so it is endless in both
 * directions and the geometry never changes.
 *
 * Two draw calls: one instanced ring for the gates, one for the streaks
 * running along the walls. The glow is a fragment-stage falloff rather
 * than a bloom pass — the gates are thin, so faking it costs nothing and
 * a real bloom would cost the whole screen.
 */

const LENGTH = 90;

export const GATE_VERT = /* glsl */ `
varying vec2 vUv;
varying float vFade;
varying float vIndex;

attribute float aIndex;

void main() {
  vUv = uv;
  vIndex = aIndex;
  vec4 world = instanceMatrix * vec4(position, 1.0);
  world = modelMatrix * world;
  vec4 mv = viewMatrix * world;
  float depth = -mv.z;
  // Fade in from the far end and out as they pass, so nothing pops.
  vFade = smoothstep(88.0, 45.0, depth) * smoothstep(1.0, 9.0, depth);
  gl_Position = projectionMatrix * mv;
}`;

export const GATE_FRAG = /* glsl */ `
precision mediump float;

uniform vec3  uAccent;
uniform vec3  uHot;
uniform float uTime;

varying vec2 vUv;
varying float vFade;
varying float vIndex;

void main() {
  // A torus UV runs 0..1 around the minor radius; pushing brightness to
  // the centre of that band makes a thin tube read as a lit filament.
  float across = abs(vUv.y - 0.5) * 2.0;
  float filament = pow(1.0 - across, 2.6);

  // Every few gates burns hot instead of accent, which gives the tunnel a
  // rhythm as you fall through it.
  float hot = step(0.72, fract(vIndex * 0.37));
  vec3 col = mix(uAccent, uHot, hot);

  // A pulse travelling around the ring.
  float chase = 0.75 + 0.25 * sin(vUv.x * 18.0 - uTime * 2.4 + vIndex);

  gl_FragColor = vec4(col * (0.5 + filament * 2.2) * chase, filament * vFade);
}`;

function Gates({ accent, hot }: { accent: THREE.Color; hot: THREE.Color }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = quality.tier === "low" ? 18 : quality.tier === "mid" ? 30 : 46;

  const gates = useMemo(() => {
    const rnd = makeRng(0x4e19b2);
    return Array.from({ length: count }, (_, i) => ({
      z: -(i / count) * LENGTH,
      radius: 4.2 + rnd() * 1.6,
      tilt: (rnd() - 0.5) * 0.5,
      roll: rnd() * Math.PI * 2,
      spin: (rnd() - 0.5) * 0.4,
      wobble: rnd() * Math.PI * 2,
    }));
  }, [count]);

  // Per-instance index so the fragment stage can vary each gate.
  const indices = useMemo(
    () => new Float32Array(Array.from({ length: count }, (_, i) => i)),
    [count],
  );

  const travel = useRef(0);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;

    // Constant fall plus scroll: the tunnel moves even when the page does
    // not, so it never looks frozen.
    travel.current += d * 5.5 + scroll.velocity * 0.35;

    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      // Wrap into the tunnel length so the run is endless.
      let z = g.z + travel.current;
      z = ((z % LENGTH) + LENGTH) % LENGTH - LENGTH + 6;

      _dummy.position.set(
        Math.sin(t * 0.2 + g.wobble) * 0.6,
        Math.cos(t * 0.17 + g.wobble) * 0.5,
        z,
      );
      _dummy.rotation.set(g.tilt * 0.4, g.tilt, g.roll + t * g.spin);
      _dummy.scale.setScalar(g.radius);
      _dummy.updateMatrix();
      m.setMatrixAt(i, _dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (mat.current) mat.current.uniforms.uTime.value = t;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <torusGeometry args={[1, 0.028, 8, 96]} />
      <instancedBufferAttribute attach="geometry-attributes-aIndex" args={[indices, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={GATE_VERT}
        fragmentShader={GATE_FRAG}
        uniforms={{
          uAccent: { value: accent },
          uHot: { value: hot },
          uTime: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

export const STREAK_VERT = /* glsl */ `
uniform float uTravel;
uniform float uLength;
varying float vA;
void main() {
  vec3 p = position;
  // Same wrap as the gates, so streaks and gates travel together.
  p.z = mod(p.z + uTravel, uLength) - uLength + 6.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  vA = smoothstep(80.0, 20.0, depth) * smoothstep(1.0, 8.0, depth);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 46.0 / max(depth, 1.0);
}`;

export const STREAK_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
varying float vA;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d2 = dot(uv, uv);
  if (d2 > 0.25) discard;
  gl_FragColor = vec4(uAccent, pow(smoothstep(0.25, 0.0, d2), 2.0) * vA * 0.85);
}`;

/** Streaks running along the tunnel wall, for a sense of speed. */
function Streaks({ accent }: { accent: THREE.Color }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = quality.tier === "low" ? 40 : 110;

  const positions = useMemo(() => {
    const rnd = makeRng(0x991c74);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 3.6 + rnd() * 2.4;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = -rnd() * LENGTH;
    }
    return arr;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTravel: { value: 0 }, uAccent: { value: accent }, uLength: { value: LENGTH } }),
    [accent],
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTravel.value += Math.min(dt, 0.05) * 5.5 + scroll.velocity * 0.35;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={STREAK_VERT}
        fragmentShader={STREAK_FRAG}
      />
    </points>
  );
}

export default function Neon() {
  const group = useRef<THREE.Group>(null);
  const accent = useMemo(() => new THREE.Color(WORLDS.neon.accent), []);
  // Every few gates burns dimmer instead of hotter — the rhythm survives
  // without a second hue.
  const hot = useMemo(() => new THREE.Color("#9a9aa2"), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    // Steering: the tunnel banks toward the pointer.
    g.position.x = damp(g.position.x, -pointer.sx * 1.4, 2.5, d);
    g.position.y = damp(g.position.y, pointer.sy * 1.0, 2.5, d);
    g.rotation.z = damp(g.rotation.z, pointer.sx * 0.12, 2, d);
  });

  return (
    <group ref={group}>
      <Gates accent={accent} hot={hot} />
      <Streaks accent={accent} />
    </group>
  );
}
