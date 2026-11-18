import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetGLBModelProps {
  modelPath: string;
  targetDiameter: number;
}

export const PlanetGLBModel: React.FC<PlanetGLBModelProps> = ({ modelPath, targetDiameter }) => {
  const { scene } = useGLTF(modelPath);

  const { cloned, scale } = useMemo(() => {
    const c = scene.clone();
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Compute bounding box of the planet body (excluding ring/circle meshes to prevent distortion)
    const bodyBox = new THREE.Box3();
    let hasBodyMesh = false;

    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const name = (child.name || '').toLowerCase();
        const isRing = name.includes('ring') || name.includes('circle');
        if (!isRing) {
          const b = new THREE.Box3().setFromObject(child);
          bodyBox.union(b);
          hasBodyMesh = true;
        }
      }
    });

    // Fallback if no specific body mesh was found
    if (!hasBodyMesh) {
      bodyBox.setFromObject(c);
    }

    const bodySize = new THREE.Vector3();
    bodyBox.getSize(bodySize);
    const maxBodyDimension = Math.max(bodySize.x, bodySize.y, bodySize.z);

    // Normalize scale so the planet's spherical body matches the exact target diameter in AU
    const computedScale = maxBodyDimension > 0 ? targetDiameter / maxBodyDimension : 1.0;
    return { cloned: c, scale: computedScale };
  }, [scene, targetDiameter]);

  return (
    <primitive
      object={cloned}
      scale={[scale, scale, scale]}
    />
  );
};
