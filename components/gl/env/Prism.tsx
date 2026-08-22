"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeRng, pointer, quality, scroll, damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { LIGHTING, PALETTE } from "../shared/glsl";

/**
 * World 03 — Prism.
 *
 * Faceted shards that split the light. Real refraction would mean
 * rendering the scene into a buffer for every shard; instead the
 * dispersion is faked in the fragment stage — view angle drives a cosine
 * palette, so the colour shifts as each face turns. It costs about thirty
 * instructions and reads, at this scale, as glass.
 */

export const PRISM_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDepth;

void main() {
  vec4 world = instanceMatrix * vec4(position, 1.0);
  world = modelMatrix * world;

  mat3 nm = mat3(modelMatrix) * mat3(instanceMatrix);
  vNormalW = normalize(nm * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  vDepth = world.z;

  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const PRISM_FRAG = /* glsl */ `
precision highp float;
${LIGHTING}
${PALETTE}

uniform vec3  uAccent;
uniform float uTime;
uniform float uSpread;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDepth;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);

  // Dispersion stand-in: the hue is a function of view angle and depth, so
  // colour travels across a face as it turns rather than sitting on it.
  float t = fres * 0.9 + vDepth * 0.05 + uTime * 0.02;
  // Greyscale ramp rather than a spectrum: the shards split light into
  // value, not hue, which is the only kind of dispersion this palette has.
  vec3 split = vec3(cosPalette(t, vec3(0.55), vec3(0.45), vec3(1.0), vec3(0.0)).r);

  vec3 base = mix(vec3(0.06, 0.06, 0.09), split * 0.55, uSpread);
  vec3 col = studio(N, V, base, mix(uAccent, split, 0.5), 2.6, 48.0);

  // Edges carry the accent hardest — that is where a real prism throws.
  col += uAccent * pow(fres, 3.0) * 1.2;

  gl_FragColor = vec4(col, 0.82 + fres * 0.18);
}`;

/* Reused every frame; module scope keeps mutable scratch out of React. */
const _dummy = new THREE.Object3D();

type Shard = {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  phase: number;
};

export default function Prism() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);

  const accent = useMemo(() => new THREE.Color(WORLDS.prism.accent), []);

  const count = quality.tier === "low" ? 7 : quality.tier === "mid" ? 11 : 15;

  // Mutated every frame, so it lives in a ref and is built on first
  // frame rather than during render.
  const shardsRef = useRef<Shard[] | null>(null);

  const buildShards = (n: number): Shard[] => {
    const rnd = makeRng(0x3ac91f);
    return Array.from({ length: n }, (_, i) => {
      // Arrange on a loose double helix so the cluster has structure
      // rather than reading as scattered debris.
      const t = i / n;
      const a = t * Math.PI * 3.4 + (i % 2) * Math.PI;
      const r = 2.4 + rnd() * 3.4;
      return {
        pos: new THREE.Vector3(
          Math.cos(a) * r,
          (t - 0.5) * 9.5 + (rnd() - 0.5) * 1.2,
          Math.sin(a) * r * 0.7 - 1.5,
        ),
        rot: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6),
        spin: new THREE.Vector3(
          (rnd() - 0.5) * 0.32,
          (rnd() - 0.5) * 0.4,
          (rnd() - 0.5) * 0.22,
        ),
        scale: 0.5 + Math.pow(rnd(), 1.6) * 1.5,
        phase: rnd() * Math.PI * 2,
      };
    });
  };

  const uniforms = useMemo(
    () => ({
      uAccent: { value: accent },
      uTime: { value: 0 },
      uSpread: { value: 0.6 },
    }),
    [accent],
  );

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const d = Math.min(dt, 0.05);
    const time = state.clock.elapsedTime;

    if (!shardsRef.current || shardsRef.current.length !== count) {
      shardsRef.current = buildShards(count);
    }
    const shards = shardsRef.current;

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      _dummy.position.copy(s.pos);
      _dummy.position.y += Math.sin(time * 0.35 + s.phase) * 0.35;
      _dummy.position.x += Math.cos(time * 0.28 + s.phase) * 0.22;

      // Pointer turns the whole cluster; each shard also keeps its own
      // slow tumble, so the group never moves as a rigid block.
      s.rot.x += s.spin.x * d + pointer.sy * d * 0.25;
      s.rot.y += s.spin.y * d + pointer.sx * d * 0.35;
      s.rot.z += s.spin.z * d;
      _dummy.rotation.copy(s.rot);
      _dummy.scale.setScalar(s.scale);
      _dummy.updateMatrix();
      m.setMatrixAt(i, _dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (mat.current) {
      mat.current.uniforms.uTime.value = time;
      // Scroll widens the dispersion, so reading down the page pulls the
      // colour further apart.
      mat.current.uniforms.uSpread.value = 0.45 + scroll.progress * 0.55;
    }

    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, pointer.sx * 0.3, 3, d);
      group.current.rotation.x = damp(group.current.rotation.x, -pointer.sy * 0.18, 3, d);
      group.current.position.y = damp(group.current.position.y, scroll.progress * 5, 4, d);
      group.current.position.x = 3.4;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <shaderMaterial
          ref={mat}
          vertexShader={PRISM_VERT}
          fragmentShader={PRISM_FRAG}
          uniforms={uniforms}
          transparent
        />
      </instancedMesh>
    </group>
  );
}
