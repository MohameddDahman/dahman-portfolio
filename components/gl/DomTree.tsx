"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { makeRng } from "@/lib/rng";

/**
 * Figure 01 — a DOM tree, and a render pass walking it.
 *
 * The one piece of 3D left on the site, and the only one that earns its
 * place: a root, a fan of children, and a traversal that walks the whole
 * structure depth-first — which is the actual shape of the work, not an
 * abstract shape placed near it.
 *
 * It draws in ink on paper, it is bounded by a frame, and it stops
 * rendering entirely when it scrolls out of view. Two draw calls, and the
 * traversal is one uniform rather than forty animations.
 */

type Node = {
  pos: THREE.Vector3;
  depth: number;
  order: number;
  parent: number;
};

/** Depth-first, so `order` genuinely is traversal order. */
function buildTree(maxDepth: number, seed: number): Node[] {
  const rnd = makeRng(seed);
  const nodes: Node[] = [];
  let order = 0;

  function grow(pos: THREE.Vector3, depth: number, parent: number, spread: number) {
    const self = nodes.length;
    nodes.push({ pos: pos.clone(), depth, order: order++, parent });
    if (depth >= maxDepth) return;

    // Markup narrows toward its leaves rather than fanning out forever.
    const kids = depth === 0 ? 3 : rnd() > 0.45 ? 3 : 2;
    const drop = 1.3 - depth * 0.1;

    for (let i = 0; i < kids; i++) {
      const a = ((i + 0.5) / kids - 0.5) * spread + (rnd() - 0.5) * 0.24;
      const tilt = (rnd() - 0.5) * spread * 0.6;
      grow(
        new THREE.Vector3(
          pos.x + Math.sin(a) * drop * 1.6,
          pos.y - drop,
          pos.z + Math.sin(tilt) * drop,
        ),
        depth + 1,
        self,
        spread * 0.7,
      );
    }
  }

  grow(new THREE.Vector3(0, 2.7, 0), 0, -1, 2.4);
  return nodes;
}

const NODE_VERT = /* glsl */ `
uniform float uHead;
uniform float uTotal;

attribute float aOrder;
attribute float aDepth;

varying float vHot;
varying float vDepth;

void main() {
  // How far behind the traversal head this node is, in node counts.
  float behind = uHead * uTotal - aOrder;
  vHot = exp(-max(behind, 0.0) * 0.28) * step(-0.5, behind);
  vDepth = aDepth;

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  // Root largest, leaves smallest: size carries hierarchy.
  gl_PointSize = (7.0 - aDepth * 0.9 + vHot * 5.0) * (30.0 / max(-mv.z, 1.0));
}`;

const NODE_FRAG = /* glsl */ `
precision mediump float;

varying float vHot;
varying float vDepth;

void main() {
  // Square marks. Elements are boxes.
  vec2 uv = abs(gl_PointCoord - 0.5);
  float m = max(uv.x, uv.y);
  if (m > 0.5) discard;

  // Outlined when idle, solid when the pass reaches it — the difference
  // between a node that exists and a node being rendered.
  float ring = smoothstep(0.3, 0.4, m);
  float ink = mix(0.62 - vDepth * 0.04, 0.06, vHot);
  float a = mix(0.5 * ring, 1.0, vHot);

  gl_FragColor = vec4(vec3(ink), a);
}`;

const EDGE_VERT = /* glsl */ `
uniform float uHead;
uniform float uTotal;
attribute float aOrder;
varying float vHot;

void main() {
  float behind = uHead * uTotal - aOrder;
  vHot = exp(-max(behind, 0.0) * 0.32) * step(-0.5, behind);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const EDGE_FRAG = /* glsl */ `
precision mediump float;
varying float vHot;
void main() {
  float ink = mix(0.74, 0.1, vHot);
  gl_FragColor = vec4(vec3(ink), 0.35 + vHot * 0.65);
}`;

function Scene() {
  const group = useRef<THREE.Group>(null);
  const nodeMat = useRef<THREE.ShaderMaterial>(null);
  const edgeMat = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const { nodePos, nodeOrder, nodeDepth, edgePos, edgeOrder, total } = useMemo(() => {
    const nodes = buildTree(4, 0x2b71f3);
    const n = nodes.length;

    const nodePos = new Float32Array(n * 3);
    const nodeOrder = new Float32Array(n);
    const nodeDepth = new Float32Array(n);

    nodes.forEach((node, i) => {
      nodePos.set([node.pos.x, node.pos.y, node.pos.z], i * 3);
      nodeOrder[i] = node.order;
      nodeDepth[i] = node.depth;
    });

    // One segment per parent link, inheriting the child's traversal order
    // so an edge lights as the pass descends into it.
    const links = nodes.filter((node) => node.parent >= 0);
    const edgePos = new Float32Array(links.length * 6);
    const edgeOrder = new Float32Array(links.length * 2);

    links.forEach((node, i) => {
      const p = nodes[node.parent];
      edgePos.set([p.pos.x, p.pos.y, p.pos.z, node.pos.x, node.pos.y, node.pos.z], i * 6);
      edgeOrder[i * 2] = node.order;
      edgeOrder[i * 2 + 1] = node.order;
    });

    return { nodePos, nodeOrder, nodeDepth, edgePos, edgeOrder, total: n };
  }, []);

  const nodeUniforms = useMemo(
    () => ({ uHead: { value: 0 }, uTotal: { value: total } }),
    [total],
  );
  const edgeUniforms = useMemo(
    () => ({ uHead: { value: 0 }, uTotal: { value: total } }),
    [total],
  );

  const head = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);

    // Slow. A page is never finished re-rendering, but nothing here
    // should pull the eye off the paragraph beside it.
    head.current = (head.current + d * 0.08) % 1.4;
    if (nodeMat.current) nodeMat.current.uniforms.uHead.value = head.current;
    if (edgeMat.current) edgeMat.current.uniforms.uHead.value = head.current;

    // Pointer parallax, scoped to this canvas because the canvas is now a
    // bounded element rather than a full-page overlay.
    const g = group.current;
    if (g) {
      const k = 1 - Math.exp(-3 * d);
      g.rotation.y += (pointer.x * 0.34 - g.rotation.y) * k;
      g.rotation.x += (-pointer.y * 0.14 - g.rotation.x) * k;
    }
  });

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePos, 3]} />
          <bufferAttribute attach="attributes-aOrder" args={[edgeOrder, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={edgeMat}
          vertexShader={EDGE_VERT}
          fragmentShader={EDGE_FRAG}
          uniforms={edgeUniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePos, 3]} />
          <bufferAttribute attach="attributes-aOrder" args={[nodeOrder, 1]} />
          <bufferAttribute attach="attributes-aDepth" args={[nodeDepth, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function DomTree({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 9.5] }}
      // Stops dead once the figure scrolls out of view. Nothing on this
      // page should be spending frames the reader cannot see.
      frameloop={active ? "always" : "never"}
    >
      <Scene />
    </Canvas>
  );
}
