import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetGLBModelProps {
  modelPath: string;
  targetDiameter: number;
}

// Global cache for computed unscaled dimensions to avoid redundant vertex traversals
const bodyDimensionCache = new Map<string, number>();

export const PlanetGLBModel: React.FC<PlanetGLBModelProps> = ({ modelPath, targetDiameter }) => {
  const { scene } = useGLTF(modelPath);

  const { cloned, scale } = useMemo(() => {
    const c = scene.clone();

    // Traverse and configure materials for high fidelity texture display
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        if (mesh.material) {
          const rawMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const clonedMats = rawMats.map((origMat) => {
            const mat = origMat.clone();
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Pure white base to display full texture clarity
              mat.color.set('#ffffff');
              mat.roughness = Math.min(mat.roughness, 0.75);
              mat.metalness = Math.min(mat.metalness, 0.05);

              // Check if mesh represents planetary rings
              const meshName = (mesh.name || '').toLowerCase();
              const matName = (mat.name || '').toLowerCase();
              if (meshName.includes('ring') || meshName.includes('circle') || matName.includes('ring')) {
                mat.transparent = true;
                mat.opacity = 0.88;
                mat.side = THREE.DoubleSide;
              }

              if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
                mat.map.needsUpdate = true;
              }
              mat.needsUpdate = true;
            }
            return mat;
          });
          mesh.material = Array.isArray(mesh.material) ? clonedMats : clonedMats[0];
        }
      }
    });

    let maxBodyDimension = bodyDimensionCache.get(modelPath);
    if (!maxBodyDimension) {
      // Compute bounding box of the planet body (excluding rings to prevent scale distortion)
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

      if (!hasBodyMesh) {
        bodyBox.setFromObject(c);
      }

      const bodySize = new THREE.Vector3();
      bodyBox.getSize(bodySize);
      maxBodyDimension = Math.max(bodySize.x, bodySize.y, bodySize.z);
      bodyDimensionCache.set(modelPath, maxBodyDimension);
    }

    // Normalize scale so the spherical body matches the exact target diameter in AU
    const computedScale = maxBodyDimension > 0 ? targetDiameter / maxBodyDimension : 1.0;
    return { cloned: c, scale: computedScale };
  }, [scene, modelPath, targetDiameter]);

  return (
    <primitive
      object={cloned}
      scale={[scale, scale, scale]}
    />
  );
};

// Preload all planetary 3D models into cache upfront so zooming out doesn't trigger lazy-fetch hitching
useGLTF.preload('/models/planets/sun.glb');
useGLTF.preload('/models/planets/earth.glb');
useGLTF.preload('/models/planets/mercury.glb');
useGLTF.preload('/models/planets/venus.glb');
useGLTF.preload('/models/planets/mars.glb');
useGLTF.preload('/models/planets/jupitar.glb');
useGLTF.preload('/models/planets/saturn.glb');
useGLTF.preload('/models/planets/uranus.glb');
useGLTF.preload('/models/planets/neptune.glb');
useGLTF.preload('/models/voyager.glb');
