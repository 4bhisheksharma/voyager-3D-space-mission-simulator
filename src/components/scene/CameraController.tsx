import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { getPlanetPositionAU } from '../../utils/astronomy';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  jd: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef, jd }) => {
  const { camera } = useThree();
  const { cameraTarget, isFollowingSpacecraft, v1Current, v2Current } = useSimulation();

  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const desiredCamPos = useRef(new THREE.Vector3(0, 45, 65));
  const lastTarget = useRef<string>('');

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    let newTarget = new THREE.Vector3(0, 0, 0);
    let offsetDistance = 2.0;

    switch (cameraTarget) {
      case 'overview':
        newTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 60, 90);
        break;

      case 'inner_solar_system':
        newTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 5, 8);
        break;

      case 'sun':
        newTarget.set(0, 0, 0);
        offsetDistance = 2.5;
        break;

      case 'earth':
      case 'jupiter':
      case 'saturn':
      case 'uranus':
      case 'neptune': {
        const [px, py, pz] = getPlanetPositionAU(cameraTarget, jd);
        newTarget.set(px, py, pz);
        offsetDistance = cameraTarget === 'jupiter' || cameraTarget === 'saturn' ? 3.0 : 1.8;
        break;
      }

      case 'voyager1': {
        if (v1Current) {
          newTarget.set(v1Current.x, v1Current.y, v1Current.z);
          offsetDistance = 1.2;
        }
        break;
      }

      case 'voyager2': {
        if (v2Current) {
          newTarget.set(v2Current.x, v2Current.y, v2Current.z);
          offsetDistance = 1.2;
        }
        break;
      }

      default:
        newTarget.set(0, 0, 0);
        break;
    }

    // If target changed, recompute desired camera position relative to target
    if (lastTarget.current !== cameraTarget) {
      lastTarget.current = cameraTarget;
      if (cameraTarget !== 'overview' && cameraTarget !== 'inner_solar_system') {
        desiredCamPos.current.copy(newTarget).add(new THREE.Vector3(offsetDistance * 0.8, offsetDistance * 0.6, offsetDistance));
      }
    } else if (isFollowingSpacecraft && (cameraTarget === 'voyager1' || cameraTarget === 'voyager2')) {
      // Keep following the spacecraft's moving coordinates
      const camOffset = camera.position.clone().sub(controlsRef.current.target);
      desiredCamPos.current.copy(newTarget).add(camOffset);
    }

    // Smooth lerp damping
    const lerpFactor = Math.min(delta * 4.0, 1.0);
    controlsRef.current.target.lerp(newTarget, lerpFactor);

    if (cameraTarget !== 'overview' && (isFollowingSpacecraft || camera.position.distanceTo(desiredCamPos.current) > 0.05)) {
      camera.position.lerp(desiredCamPos.current, lerpFactor);
    }

    controlsRef.current.update();
  });

  return null;
};

