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

    // Compute exact world bounding box of the loaded GLTF model
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Normalize to exact target diameter in AU
    const computedScale = maxDimension > 0 ? targetDiameter / maxDimension : 1.0;
    return { cloned: c, scale: computedScale };
  }, [scene, targetDiameter]);

  return (
    <primitive
      object={cloned}
      scale={[scale, scale, scale]}
    />
  );
};
