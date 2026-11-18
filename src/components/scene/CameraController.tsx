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

// Cubic ease-in-out curve for cinematic transitions
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef, jd }) => {
  const { camera } = useThree();
  const { 
    cameraTarget, 
    setCameraTarget, 
    isFollowingSpacecraft, 
    v1Current, 
    v2Current,
    currentTimeMs 
  } = useSimulation();

  const desiredCamPos = useRef(new THREE.Vector3(0, 35, 55));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));
  const lastTarget = useRef<string>('');

  // Cinematic Prologue: Zoom out from radiant Sun to Earth
  const isIntroActive = useRef(true);
  const introElapsed = useRef(0);
  const INTRO_DURATION = 3.6; // seconds

  // Handle user interruptions to seamlessly cancel the intro sequence
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isIntroActive.current) {
        isIntroActive.current = false;
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // 1. FREE CAMERA MODE: User has total freedom to pan, orbit, and zoomToCursor anywhere in space
    if (cameraTarget === 'free') {
      isIntroActive.current = false;
      controlsRef.current.update();
      return;
    }

    // 2. CINEMATIC INTRO SEQUENCE: Sun -> Earth
    if (isIntroActive.current) {
      introElapsed.current += delta;
      const progress = Math.min(introElapsed.current / INTRO_DURATION, 1.0);
      const ease = easeInOutCubic(progress);

      const [ex, ey, ez] = getPlanetPositionAU('earth', jd);
      const sunTarget = new THREE.Vector3(0, 0, 0);
      const earthTarget = new THREE.Vector3(ex, ey, ez);

      // Start: Close, warm framing of the Sun
      const sunCamStart = new THREE.Vector3(0, 0.04, 0.22);
      // End: Cinematic arrival framing of Earth poised for Voyager launch
      const earthCamEnd = new THREE.Vector3(ex + 0.035, ey + 0.03, ez + 0.06);

      // Interpolate target and camera position with an arc above the ecliptic plane
      const currentTarget = new THREE.Vector3().lerpVectors(sunTarget, earthTarget, ease);
      const currentCam = new THREE.Vector3().lerpVectors(sunCamStart, earthCamEnd, ease);
      // Gentle vertical arc
      currentCam.y += Math.sin(ease * Math.PI) * 0.08;

      controlsRef.current.target.copy(currentTarget);
      camera.position.copy(currentCam);
      controlsRef.current.update();

      if (progress >= 1.0) {
        isIntroActive.current = false;
        // Settle smoothly into Earth target
        setCameraTarget('earth');
      }
      return;
    }

    // 3. TARGETED CAMERA FOCUS MODES
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

    // When camera target changes, initiate a smooth, subtle professional zoom framing
    if (lastTarget.current !== cameraTarget) {
      lastTarget.current = cameraTarget;
      if (cameraTarget !== 'overview' && cameraTarget !== 'inner_solar_system') {
        desiredCamPos.current.copy(newTarget).add(
          new THREE.Vector3(offsetDistance * 0.7, offsetDistance * 0.45, offsetDistance)
        );
      }
    } else if (isFollowingSpacecraft && (cameraTarget === 'voyager1' || cameraTarget === 'voyager2')) {
      // Maintain continuous lock-on offset as spacecraft moves through space
      const camOffset = camera.position.clone().sub(controlsRef.current.target);
      desiredCamPos.current.copy(newTarget).add(camOffset);
    }

    // Critically damped exponential lerp for buttery smooth 60fps camera movement
    const lerpFactor = 1.0 - Math.exp(-6.0 * delta);
    controlsRef.current.target.lerp(desiredTarget.current, lerpFactor);

    if (cameraTarget !== 'overview' && (isFollowingSpacecraft || camera.position.distanceTo(desiredCamPos.current) > 0.001)) {
      camera.position.lerp(desiredCamPos.current, lerpFactor);
    }

    controlsRef.current.update();
  });

  return null;
};
