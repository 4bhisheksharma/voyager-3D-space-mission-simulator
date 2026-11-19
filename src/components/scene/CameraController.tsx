import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { getPlanetPositionAU, getSafeSpacecraftPosition } from '../../utils/astronomy';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  jd: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef, jd }) => {
  const { camera } = useThree();
  const { 
    cameraTarget, 
    isFollowingSpacecraft, 
    v1Current, 
    v2Current,
    currentTimeMs 
  } = useSimulation();

  const desiredCamPos = useRef(new THREE.Vector3(0, 35, 55));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));
  const lastTarget = useRef<string>('overview');
  const isTransitioning = useRef<boolean>(false);
  const isUserInteracting = useRef<boolean>(false);

  // Detect user orbit/pan/zoom to pause auto-lerping so controls never fight the user
  useEffect(() => {
    const handleStart = () => {
      isUserInteracting.current = true;
      isTransitioning.current = false;
    };
    const handleEnd = () => {
      isUserInteracting.current = false;
    };

    window.addEventListener('pointerdown', handleStart, { passive: true });
    window.addEventListener('pointerup', handleEnd, { passive: true });
    window.addEventListener('wheel', handleStart, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleStart);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('wheel', handleStart);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // 1. FREE CAMERA MODE: Total freedom to pan, orbit, and zoom anywhere in space
    if (cameraTarget === 'free') {
      controlsRef.current.update();
      return;
    }

    // 2. TARGETED CAMERA FOCUS MODES
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
        offsetDistance = 0.28;
        break;

      case 'earth': {
        const [px, py, pz] = getPlanetPositionAU('earth', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.07;
        break;
      }

      case 'mercury': {
        const [px, py, pz] = getPlanetPositionAU('mercury', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.045;
        break;
      }

      case 'venus': {
        const [px, py, pz] = getPlanetPositionAU('venus', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.065;
        break;
      }

      case 'mars': {
        const [px, py, pz] = getPlanetPositionAU('mars', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.055;
        break;
      }

      case 'jupiter': {
        const [px, py, pz] = getPlanetPositionAU('jupiter', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.26;
        break;
      }

      case 'saturn': {
        const [px, py, pz] = getPlanetPositionAU('saturn', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.32;
        break;
      }

      case 'uranus': {
        const [px, py, pz] = getPlanetPositionAU('uranus', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.22;
        break;
      }

      case 'neptune': {
        const [px, py, pz] = getPlanetPositionAU('neptune', jd);
        newTarget.set(px, py, pz);
        offsetDistance = 0.16;
        break;
      }

      case 'voyager1': {
        const { position } = getSafeSpacecraftPosition('voyager1', v1Current, currentTimeMs);
        newTarget.set(position[0], position[1], position[2]);
        offsetDistance = 0.10;
        break;
      }

      case 'voyager2': {
        const { position } = getSafeSpacecraftPosition('voyager2', v2Current, currentTimeMs);
        newTarget.set(position[0], position[1], position[2]);
        offsetDistance = 0.10;
        break;
      }

      default:
        newTarget.set(0, 0, 0);
        break;
    }

    desiredTarget.current.copy(newTarget);

    // Target changed: initiate smooth glide to new target
    if (lastTarget.current !== cameraTarget) {
      lastTarget.current = cameraTarget;
      isTransitioning.current = true;
      if (cameraTarget === 'overview') {
        desiredCamPos.current.set(0, 35, 55);
      } else if (cameraTarget === 'inner_solar_system') {
        desiredCamPos.current.set(0, 2.2, 3.2);
      } else {
        desiredCamPos.current.copy(newTarget).add(
          new THREE.Vector3(offsetDistance * 0.7, offsetDistance * 0.45, offsetDistance)
        );
      }
    } else if (isFollowingSpacecraft && (cameraTarget === 'voyager1' || cameraTarget === 'voyager2')) {
      // Maintain continuous lock-on offset as spacecraft moves through space
      const camOffset = camera.position.clone().sub(controlsRef.current.target);
      desiredCamPos.current.copy(newTarget).add(camOffset);
      isTransitioning.current = true;
    }

    // Smooth exponential lerp
    if (isTransitioning.current && !isUserInteracting.current) {
      const lerpFactor = 1.0 - Math.exp(-5.0 * delta);
      controlsRef.current.target.lerp(desiredTarget.current, lerpFactor);
      camera.position.lerp(desiredCamPos.current, lerpFactor);

      if (
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.001 &&
        camera.position.distanceTo(desiredCamPos.current) < 0.005
      ) {
        isTransitioning.current = false;
      }
    }

    controlsRef.current.update();
  });

  return null;
};
