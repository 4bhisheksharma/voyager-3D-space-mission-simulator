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
  const desiredCamPos = useRef(new THREE.Vector3(0, 35, 55));
  const lastTarget = useRef<string>('');

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    let newTarget = new THREE.Vector3(0, 0, 0);
    let offsetDistance = 0.2;

    switch (cameraTarget) {
      case 'overview':
        newTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 35, 55);
        break;

      case 'inner_solar_system':
        newTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 2.2, 3.2);
        break;

      case 'sun':
        newTarget.set(0, 0, 0);
        offsetDistance = 0.22;
        break;

      case 'earth': {
        const [px, py, pz] = getPlanetPositionAU('earth', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.09;
        break;
      }

      case 'mercury': {
        const [px, py, pz] = getPlanetPositionAU('mercury', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.06;
        break;
      }

      case 'venus': {
        const [px, py, pz] = getPlanetPositionAU('venus', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.08;
        break;
      }

      case 'mars': {
        const [px, py, pz] = getPlanetPositionAU('mars', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.08;
        break;
      }

      case 'jupiter': {
        const [px, py, pz] = getPlanetPositionAU('jupiter', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.28;
        break;
      }

      case 'saturn': {
        const [px, py, pz] = getPlanetPositionAU('saturn', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.26;
        break;
      }

      case 'uranus':
      case 'neptune': {
        const [px, py, pz] = getPlanetPositionAU(cameraTarget, jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.16;
        break;
      }

      case 'voyager1': {
        if (v1Current) {
          newTarget.set(v1Current.x, v1Current.y, v1Current.z);
          offsetDistance = 0.08;
        }
        break;
      }

      case 'voyager2': {
        if (v2Current) {
          newTarget.set(v2Current.x, v2Current.y, v2Current.z);
          offsetDistance = 0.08;
        }
        break;
      }

      default:
        newTarget.set(0, 0, 0);
        break;
    }

    // When target changes, set desired camera position relative to target
    if (lastTarget.current !== cameraTarget) {
      lastTarget.current = cameraTarget;
      if (cameraTarget !== 'overview' && cameraTarget !== 'inner_solar_system') {
        desiredCamPos.current.copy(newTarget).add(new THREE.Vector3(offsetDistance * 0.7, offsetDistance * 0.5, offsetDistance));
      }
    } else if (isFollowingSpacecraft && (cameraTarget === 'voyager1' || cameraTarget === 'voyager2')) {
      // Maintain continuous lock-on offset as spacecraft moves through space
      const camOffset = camera.position.clone().sub(controlsRef.current.target);
      desiredCamPos.current.copy(newTarget).add(camOffset);
    }

    // Damped lerp
    const lerpFactor = Math.min(delta * 4.0, 1.0);
    controlsRef.current.target.lerp(newTarget, lerpFactor);

    if (cameraTarget !== 'overview' && (isFollowingSpacecraft || camera.position.distanceTo(desiredCamPos.current) > 0.005)) {
      camera.position.lerp(desiredCamPos.current, lerpFactor);
    }

    controlsRef.current.update();
  });

  return null;
};
