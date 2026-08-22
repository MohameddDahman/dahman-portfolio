import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { pointer } from "@/lib/motion-state";

/**
 * Projects the pointer onto a plane in world space.
 *
 * The canvas sits behind the content and takes no pointer events of its
 * own, so nothing can be picked by raycasting the DOM. Instead the pointer
 * is tracked globally and unprojected here — which means the worlds stay
 * interactive even though every click still belongs to the page on top.
 */
export function usePointerPlane(z = 0) {
  const { camera } = useThree();

  return useMemo(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -z);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    return function read(out: THREE.Vector3) {
      ndc.set(pointer.nx, -pointer.ny);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) out.copy(hit);
      return out;
    };
  }, [camera, z]);
}
