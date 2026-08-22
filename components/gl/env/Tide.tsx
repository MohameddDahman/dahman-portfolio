"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { pointer, quality, scroll, damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { SNOISE2 } from "../shared/glsl";
import { usePointerPlane } from "../shared/usePointerPlane";

/**
 * World 06 — Tide.
 *
 * A surface that remembers where you touched it.
 *
 * The waves are three summed Gerstner-ish terms in the vertex stage. The
 * interaction is a small ring buffer of ripple origins passed as uniforms:
 * each pointer move drops a new one, and every vertex sums the expanding
 * rings. Eight ripples is enough to feel continuous and cheap enough that
 * the whole ocean is still one draw call.
 */

const RIPPLES = 8;

export const TIDE_VERT = /* glsl */ `
${SNOISE2}

uniform float uTime;
uniform vec3  uRipples[${RIPPLES}];   // xy = origin, z = birth time
uniform float uSwell;

varying float vHeight;
varying float vRipple;
varying vec2  vPos;
varying vec3  vNormalW;

float waves(vec2 p, float t) {
  float h = 0.0;
  h += sin(p.x * 0.34 + t * 0.9) * 0.42;
  h += sin(p.y * 0.27 - t * 0.7) * 0.36;
  h += sin((p.x + p.y) * 0.19 + t * 0.5) * 0.30;
  h += fbm2(p * 0.11 + t * 0.05, 3) * 0.5;
  return h;
}

float ripples(vec2 p, float t) {
  float sum = 0.0;
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec3 r = uRipples[i];
    float age = t - r.z;
    if (age < 0.0 || age > 3.2) continue;
    float d = distance(p, r.xy);
    // An expanding ring with a decaying amplitude — a dropped stone, not
    // a pulsing blob.
    float front = age * 6.5;
    float band = exp(-pow(d - front, 2.0) * 0.55);
    sum += band * (1.0 - age / 3.2) * 0.85;
  }
  return sum;
}

void main() {
  vec3 p = position;
  float t = uTime;

  float base = waves(p.xy, t) * uSwell;
  float rip = ripples(p.xy, t);
  float h = base + rip;

  p.z = h;
  vHeight = h;
  vRipple = rip;
  vPos = p.xy;

  // Normal from two finite differences of the same field, so the lighting
  // agrees with the displacement without a second geometry pass.
  const float e = 0.35;
  float hx = waves(p.xy + vec2(e, 0.0), t) * uSwell + ripples(p.xy + vec2(e, 0.0), t);
  float hy = waves(p.xy + vec2(0.0, e), t) * uSwell + ripples(p.xy + vec2(0.0, e), t);
  vec3 tx = normalize(vec3(e, 0.0, hx - h));
  vec3 ty = normalize(vec3(0.0, e, hy - h));
  vNormalW = normalize(cross(tx, ty));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

export const TIDE_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uAccent;
uniform vec3 uDeep;

varying float vHeight;
varying float vRipple;
varying vec2  vPos;
varying vec3  vNormalW;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(vec3(0.3, 0.5, 0.8));

  float key = clamp(dot(N, L), 0.0, 1.0);
  float spec = pow(key, 60.0);

  // Depth tint: crests catch the accent, troughs go deep. Reads as water
  // without a single reflection sample.
  float lift = smoothstep(-0.9, 1.1, vHeight);
  vec3 col = mix(uDeep, uAccent * 0.7, lift);

  col += uAccent * spec * 1.3;
  col += uAccent * vRipple * 0.9;

  // Foam on the sharpest ripple crests only.
  float foam = smoothstep(0.55, 0.95, vRipple);
  col += vec3(0.85, 0.95, 1.0) * foam * 0.5;

  float fade = smoothstep(46.0, 12.0, length(vPos));
  gl_FragColor = vec4(col, (0.42 + lift * 0.5) * fade);
}`;

export default function Tide() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const readPointer = usePointerPlane(0);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const accent = useMemo(() => new THREE.Color(WORLDS.tide.accent), []);
  const deep = useMemo(() => new THREE.Color("#08080a"), []);

  const segments = quality.tier === "low" ? 60 : quality.tier === "mid" ? 96 : 140;
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(80, 80, segments, segments),
    [segments],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSwell: { value: 1 },
      uRipples: {
        value: Array.from({ length: RIPPLES }, () => new THREE.Vector3(0, 0, -99)),
      },
      uAccent: { value: accent },
      uDeep: { value: deep },
    }),
    [accent, deep],
  );

  const slot = useRef(0);
  const lastDrop = useRef(0);
  const last = useRef(new THREE.Vector2(999, 999));

  useFrame((state, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    const time = state.clock.elapsedTime;
    u.uTime.value = time;

    readPointer(hit);

    // Drop a ripple when the pointer has actually travelled, and no more
    // than a few times a second. Dropping one per frame would fill the
    // buffer instantly and the rings would smear into noise.
    const moved = last.current.distanceTo(new THREE.Vector2(hit.x, hit.y));
    if (moved > 1.1 && time - lastDrop.current > 0.09) {
      const arr = u.uRipples.value as THREE.Vector3[];
      arr[slot.current % RIPPLES].set(hit.x, hit.y, time);
      slot.current++;
      lastDrop.current = time;
      last.current.set(hit.x, hit.y);
    }

    // Scroll raises the swell, so reading down the page builds the sea.
    u.uSwell.value = damp(u.uSwell.value, 0.7 + scroll.progress * 1.1, 2, Math.min(dt, 0.05));

    const g = group.current;
    if (g) {
      const d = Math.min(dt, 0.05);
      g.rotation.x = -1.16 + pointer.sy * 0.02;
      g.rotation.z = damp(g.rotation.z, pointer.sx * 0.05, 2.5, d);
      g.position.y = -4.4;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={mat}
          vertexShader={TIDE_VERT}
          fragmentShader={TIDE_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
