"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { makeRng, quality, scroll, pointer, damp } from "@/lib/motion-state";

/**
 * World 01 — Tree.
 *
 * The object is a DOM tree, and a render pass moving through it.
 *
 * This is the one thing a frontend engineer actually builds: a root, a
 * fan of children, and a traversal that walks the whole structure in
 * depth-first order every time something changes. So that is what is on
 * screen — nodes as marks, parent/child relationships as edges, and a
 * bright band sweeping through in traversal order. Scroll drives the
 * traversal, which means the pass runs as you read the page.
 *
 * It is a picture of the work rather than a decoration next to it.
 *
 * Two draw calls: one point cloud for the nodes, one line segment set for
 * the edges. Both carry a per-vertex traversal index so the sweep is done
 * entirely in the vertex stage from a single uniform.
 */

type Node = {
  pos: THREE.Vector3;
  depth: number;
  order: number;
  parent: number;
};

/** Depth-first build, so `order` really is traversal order. */
function buildTree(maxDepth: number, seed: number): Node[] {
  const rnd = makeRng(seed);
  const nodes: Node[] = [];
  let order = 0;

  function grow(pos: THREE.Vector3, depth: number, parent: number, spread: number) {
    const self = nodes.length;
    nodes.push({ pos: pos.clone(), depth, order: order++, parent });

    if (depth >= maxDepth) return;

    // Fewer children deeper down, the way real markup narrows toward its
    // leaves rather than fanning out forever.
    const kids = depth === 0 ? 3 : rnd() > 0.42 ? 3 : 2;
    const drop = 1.35 - depth * 0.12;

    for (let i = 0; i < kids; i++) {
      const a = ((i + 0.5) / kids - 0.5) * spread + (rnd() - 0.5) * 0.28;
      const tilt = (rnd() - 0.5) * spread * 0.7;
      const child = new THREE.Vector3(
        pos.x + Math.sin(a) * drop * 1.5,
        pos.y - drop,
        pos.z + Math.sin(tilt) * drop * 1.2,
      );
      grow(child, depth + 1, self, spread * 0.72);
    }
  }

  grow(new THREE.Vector3(0, 3.4, 0), 0, -1, 2.5);
  return nodes;
}

export const TREE_NODE_VERT = /* glsl */ `
uniform float uHead;      // traversal position, 0..1
uniform float uTotal;
uniform float uPulse;
uniform float uDim;

attribute float aOrder;
attribute float aDepth;

varying float vHot;
varying float vDepth;
varying float vDim;

void main() {
  vec3 p = position;
  vDim = uDim;

  // Distance behind the traversal head, in node counts. Only nodes the
  // pass has just touched light up; ahead of it, nothing.
  float head = uHead * uTotal;
  float behind = head - aOrder;
  float hot = exp(-max(behind, 0.0) * 0.25) * step(-0.5, behind);

  // Touched nodes lift very slightly toward the camera.
  p.z += hot * 0.35;

  vHot = hot;
  vDepth = aDepth;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;

  gl_Position = projectionMatrix * mv;
  // Root is largest; leaves are small. Size carries hierarchy.
  gl_PointSize = (5.5 - aDepth * 0.75 + hot * 5.0) * (26.0 / max(dist, 1.0)) * uPulse;
}`;

export const TREE_NODE_FRAG = /* glsl */ `
precision mediump float;

varying float vHot;
varying float vDepth;
varying float vDim;

void main() {
  // Square marks: elements are boxes, and nothing else in this interface
  // has a corner radius either.
  vec2 uv = abs(gl_PointCoord - 0.5);
  float m = max(uv.x, uv.y);
  if (m > 0.5) discard;

  // Hollow when idle, filled when the pass reaches it — the difference
  // between a node that exists and a node being rendered.
  float ring = smoothstep(0.34, 0.42, m);
  float base = 0.30 - vDepth * 0.03;

  float v = mix(base * ring, 1.0, vHot);
  float a = mix(0.55 * ring, 1.0, vHot);

  gl_FragColor = vec4(vec3(v), a * vDim);
}`;

export const TREE_EDGE_VERT = /* glsl */ `
uniform float uHead;
uniform float uTotal;
uniform float uDim;

attribute float aOrder;

varying float vHot;
varying float vDim;

void main() {
  vDim = uDim;
  float head = uHead * uTotal;
  float behind = head - aOrder;
  vHot = exp(-max(behind, 0.0) * 0.3) * step(-0.5, behind);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const TREE_EDGE_FRAG = /* glsl */ `
precision mediump float;
varying float vHot;
varying float vDim;
void main() {
  // Edges are barely there until the pass runs down them.
  float v = 0.14 + vHot * 0.86;
  gl_FragColor = vec4(vec3(v), (0.16 + vHot * 0.8) * vDim);
}`;

export default function Tree() {
  const group = useRef<THREE.Group>(null);
  const nodeMat = useRef<THREE.ShaderMaterial>(null);
  const edgeMat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const depth = quality.tier === "low" ? 3 : 4;

  const { nodePos, nodeOrder, nodeDepth, edgePos, edgeOrder, total } = useMemo(() => {
    const nodes = buildTree(depth, 0x2b71f3);
    const n = nodes.length;

    const nodePos = new Float32Array(n * 3);
    const nodeOrder = new Float32Array(n);
    const nodeDepth = new Float32Array(n);

    nodes.forEach((node, i) => {
      nodePos[i * 3] = node.pos.x;
      nodePos[i * 3 + 1] = node.pos.y;
      nodePos[i * 3 + 2] = node.pos.z;
      nodeOrder[i] = node.order;
      nodeDepth[i] = node.depth;
    });

    // One segment per parent link. The segment inherits the child's
    // traversal order, so an edge lights as the pass descends into it.
    const links = nodes.filter((node) => node.parent >= 0);
    const edgePos = new Float32Array(links.length * 6);
    const edgeOrder = new Float32Array(links.length * 2);

    links.forEach((node, i) => {
      const parent = nodes[node.parent];
      edgePos[i * 6] = parent.pos.x;
      edgePos[i * 6 + 1] = parent.pos.y;
      edgePos[i * 6 + 2] = parent.pos.z;
      edgePos[i * 6 + 3] = node.pos.x;
      edgePos[i * 6 + 4] = node.pos.y;
      edgePos[i * 6 + 5] = node.pos.z;
      edgeOrder[i * 2] = node.order;
      edgeOrder[i * 2 + 1] = node.order;
    });

    return { nodePos, nodeOrder, nodeDepth, edgePos, edgeOrder, total: n };
  }, [depth]);

  const nodeUniforms = useMemo(
    () => ({
      uHead: { value: 0 },
      uTotal: { value: total },
      uPulse: { value: 1 },
      uDim: { value: 1 },
    }),
    [total],
  );
  const edgeUniforms = useMemo(
    () => ({ uHead: { value: 0 }, uTotal: { value: total }, uDim: { value: 1 } }),
    [total],
  );

  const head = useRef(0);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;

    // The pass runs on its own slow loop, and scroll pushes it forward.
    // Idle, it still ticks — a page is never done re-rendering.
    head.current = (head.current + d * 0.09 + Math.abs(scroll.velocity) * 0.004) % 1.35;

    if (nodeMat.current) {
      nodeMat.current.uniforms.uHead.value = head.current;
      nodeMat.current.uniforms.uPulse.value = 1 + Math.sin(t * 1.6) * 0.03;
    }
    if (edgeMat.current) edgeMat.current.uniforms.uHead.value = head.current;

    const g = group.current;
    if (g) {
      // Sized against the viewport rather than a fixed scale, so it is a
      // companion to the headline on a wide screen and stays out of its
      // way on a narrow one.
      const narrow = viewport.aspect < 1.05;
      const targetScale = narrow ? 0.5 : Math.min(0.95, viewport.aspect * 0.5);
      const targetX = narrow ? 0.4 : 4.6;
      const targetY = narrow ? 1.2 : 0.2;

      // On a narrow screen there is no room beside the copy, so the tree
      // steps back to being a texture behind it rather than a companion.
      const dim = narrow ? 0.4 : 1;
      if (nodeMat.current) nodeMat.current.uniforms.uDim.value = damp(nodeMat.current.uniforms.uDim.value, dim, 4, d);
      if (edgeMat.current) edgeMat.current.uniforms.uDim.value = damp(edgeMat.current.uniforms.uDim.value, dim, 4, d);

      g.scale.setScalar(damp(g.scale.x, targetScale, 3, d));
      g.position.x = damp(g.position.x, targetX + pointer.sx * 0.45, 3, d);
      g.position.y = damp(
        g.position.y,
        targetY - pointer.sy * 0.35 + scroll.progress * 4,
        3,
        d,
      );

      g.rotation.y = damp(g.rotation.y, pointer.sx * 0.45 + t * 0.06, 2, d);
      g.rotation.x = damp(g.rotation.x, -pointer.sy * 0.18, 2.5, d);
    }
  });

  return (
    <group ref={group} position={[4.6, 0.2, -2]}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePos, 3]} />
          <bufferAttribute attach="attributes-aOrder" args={[edgeOrder, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={edgeMat}
          vertexShader={TREE_EDGE_VERT}
          fragmentShader={TREE_EDGE_FRAG}
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
          vertexShader={TREE_NODE_VERT}
          fragmentShader={TREE_NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}
