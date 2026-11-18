import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetGLBModelProps {
  modelPath: string;
  scaleFactor: number;
}

export const PlanetGLBModel: React.FC<PlanetGLBModelProps> = ({ modelPath, scaleFactor }) => {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive
      object={cloned}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
    />
  );
};
