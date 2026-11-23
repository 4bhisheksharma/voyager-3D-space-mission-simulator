import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { getPlanetPositionAU, getSafeSpacecraftPosition, getOneLightDayFlightState } from '../../utils/astronomy';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  jd: number;
}

// Reusable static vectors to eliminate GC pressure in useFrame
const _scratchTarget = new THREE.Vector3();
const _scratchCam = new THREE.Vector3();
const _scratchOffset = new THREE.Vector3();
const _scratchDir = new THREE.Vector3();
const _startDir = new THREE.Vector3(0, 0.12, 0.32).normalize();
const _endDir = new THREE.Vector3(0, 35, 55).normalize();
const _d0 = Math.hypot(0.12, 0.32);
const _d1 = Math.hypot(35, 55);
const _logRatio = Math.log(_d1 / _d0);

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef, jd }) => {
  const { camera } = useThree();
  const { 
    cameraTarget, 
    isFollowingSpacecraft, 
    v1Current, 
    v2Current,
    currentTimeMs,
    isCinematicTour,
    isOneLightDaySimulation,
    oneLightDayProgress 
  } = useSimulation();

  const desiredCamPos = useRef(new THREE.Vector3(0, 35, 55));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));
  const lastTarget = useRef<string>('overview');
  const isTransitioning = useRef<boolean>(false);
  const isUserInteracting = useRef<boolean>(false);
  const cinematicOrbitAngle = useRef<number>(0);

  // Cinematic Prologue: Slowly zoom out from radiant Sun to full Solar System on load
  const isIntroActive = useRef<boolean>(true);
  const introElapsed = useRef<number>(0);
  const INTRO_DURATION = 4.2; // seconds of cinematic pullback
  const sunCamStart = useRef(new THREE.Vector3(0, 0.12, 0.32));
  const overviewCamEnd = useRef(new THREE.Vector3(0, 35, 55));

  // Detect user orbit/pan/zoom to pause auto-lerping so controls never fight the user
  useEffect(() => {
    const handleStart = () => {
      isUserInteracting.current = true;
      isTransitioning.current = false;
      isIntroActive.current = false;
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
      isIntroActive.current = false;
      controlsRef.current.update();
      return;
    }

    // 1.5 ONE LIGHT DAY CINEMATIC SIMULATION FLIGHT:
    // Glides smoothly from the Sun [0,0,0] all the way out across the Solar System to Voyager 1 at 173.14 AU
    if (isOneLightDaySimulation) {
      isIntroActive.current = false;
      cinematicOrbitAngle.current += delta * 0.12;

      // Target position of Voyager 1
      const v1Pos = v1Current 
        ? [v1Current.x, v1Current.y, v1Current.z]
        : [-137.386967, 99.292922, -32.233514];
      const targetVec = new THREE.Vector3(v1Pos[0], v1Pos[1], v1Pos[2]);
      const dirU = targetVec.clone().normalize();

      // Perpendicular vectors for dynamic camera banking & framing
      const upWorld = new THREE.Vector3(0, 1, 0);
      const sideW = new THREE.Vector3().crossVectors(dirU, upWorld).normalize();
      const upPerp = new THREE.Vector3().crossVectors(sideW, dirU).normalize();

      const { distAU } = getOneLightDayFlightState(oneLightDayProgress);
      const flightPos = dirU.clone().multiplyScalar(distAU);

      // Camera dynamic offset based on cosmic scale:
      // Tight offset near the Sun to observe solar corona; wider offset in outer planets to observe the celestial scale
      const camOffset = Math.max(0.12, Math.min(16.0, 0.14 + Math.pow(distAU, 0.55) * 0.32));

      const flightCamPos = flightPos.clone()
        .addScaledVector(sideW, camOffset * 0.6)
        .addScaledVector(upPerp, camOffset * 0.35)
        .addScaledVector(dirU, -camOffset * 0.4);

      const flightLookTarget = flightPos.clone().addScaledVector(dirU, Math.max(0.5, camOffset * 1.4));

      // Arrival blend (at progress >= 0.94, ease into orbital inspection around Voyager 1)
      if (oneLightDayProgress >= 0.94) {
        const t = (oneLightDayProgress - 0.94) / 0.06;
        const ease = t * t * (3 - 2 * t);

        const orbRadius = 0.12;
        const angle = cinematicOrbitAngle.current + t * 3.0;
        const orbCamPos = targetVec.clone().add(new THREE.Vector3(
          Math.sin(angle) * orbRadius,
          Math.sin(angle * 0.4) * 0.03 + 0.03,
          Math.cos(angle) * orbRadius
        ));

        desiredCamPos.current.lerpVectors(flightCamPos, orbCamPos, ease);
        desiredTarget.current.lerpVectors(flightLookTarget, targetVec, ease);
      } else {
        desiredCamPos.current.copy(flightCamPos);
        desiredTarget.current.copy(flightLookTarget);
      }

      if (!isUserInteracting.current) {
        const lerpFactor = 1.0 - Math.exp(-5.5 * delta);
        camera.position.lerp(desiredCamPos.current, lerpFactor);
        controlsRef.current.target.lerp(desiredTarget.current, lerpFactor);
      }
      controlsRef.current.update();
      return;
    }

    // 2. CINEMATIC INTRO: Logarithmically-smooth, lag-free zoom out from the Sun to entire Solar System
    if (isIntroActive.current) {
      if (cameraTarget !== 'overview') {
        isIntroActive.current = false;
      } else {
        // Clamp delta to prevent sudden jump during heavy frames
        const dt = Math.min(delta, 0.033);
        introElapsed.current += dt;
        const progress = Math.min(introElapsed.current / INTRO_DURATION, 1.0);

        // Majestic cubic ease-in-out curve
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Perceptually uniform logarithmic distance interpolation
        const currentDist = _d0 * Math.exp(ease * _logRatio);
        _scratchDir.lerpVectors(_startDir, _endDir, ease).normalize();
        _scratchCam.copy(_scratchDir).multiplyScalar(currentDist);
        // Subtle vertical lift arc proportional to distance
        _scratchCam.y += Math.sin(ease * Math.PI) * (currentDist * 0.035);

        camera.position.copy(_scratchCam);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();

        if (progress >= 1.0) {
          isIntroActive.current = false;
        }
        return;
      }
    }

    // 2. TARGETED CAMERA FOCUS MODES
    _scratchTarget.set(0, 0, 0);
    let offsetDistance = 0.2;

    switch (cameraTarget) {
      case 'overview':
        _scratchTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 35, 55);
        break;

      case 'inner_solar_system':
        _scratchTarget.set(0, 0, 0);
        desiredCamPos.current.set(0, 2.2, 3.2);
        break;

      case 'sun':
        _scratchTarget.set(0, 0, 0);
        offsetDistance = 0.28;
        break;

      case 'earth': {
        const [px, py, pz] = getPlanetPositionAU('earth', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.07;
        break;
      }

      case 'mercury': {
        const [px, py, pz] = getPlanetPositionAU('mercury', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.045;
        break;
      }

      case 'venus': {
        const [px, py, pz] = getPlanetPositionAU('venus', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.065;
        break;
      }

      case 'mars': {
        const [px, py, pz] = getPlanetPositionAU('mars', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.055;
        break;
      }

      case 'jupiter': {
        const [px, py, pz] = getPlanetPositionAU('jupiter', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.26;
        break;
      }

      case 'saturn': {
        const [px, py, pz] = getPlanetPositionAU('saturn', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.32;
        break;
      }

      case 'uranus': {
        const [px, py, pz] = getPlanetPositionAU('uranus', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.22;
        break;
      }

      case 'neptune': {
        const [px, py, pz] = getPlanetPositionAU('neptune', jd);
        _scratchTarget.set(px, py, pz);
        offsetDistance = 0.16;
        break;
      }

      case 'voyager1': {
        const { position } = getSafeSpacecraftPosition('voyager1', v1Current, currentTimeMs);
        _scratchTarget.set(position[0], position[1], position[2]);
        offsetDistance = 0.10;
        break;
      }

      case 'voyager2': {
        const { position } = getSafeSpacecraftPosition('voyager2', v2Current, currentTimeMs);
        _scratchTarget.set(position[0], position[1], position[2]);
        offsetDistance = 0.10;
        break;
      }

      default:
        _scratchTarget.set(0, 0, 0);
        break;
    }

    desiredTarget.current.copy(_scratchTarget);

    // 3. CINEMATIC AUTOPILOT TOUR: Majestic orbital sweep around each milestone target
    if (isCinematicTour) {
      isIntroActive.current = false;
      cinematicOrbitAngle.current += delta * 0.06;

      const isMacro = cameraTarget === 'overview';
      const rad = isMacro ? 55 : Math.max(0.12, offsetDistance * 1.45);
      const elev = isMacro ? 35 : offsetDistance * 0.45;

      const camX = _scratchTarget.x + Math.sin(cinematicOrbitAngle.current) * rad;
      const camY = _scratchTarget.y + Math.sin(cinematicOrbitAngle.current * 0.4) * (offsetDistance * 0.25) + elev;
      const camZ = _scratchTarget.z + Math.cos(cinematicOrbitAngle.current) * rad;

      desiredCamPos.current.set(camX, camY, camZ);

      if (!isUserInteracting.current) {
        const lerpFactor = 1.0 - Math.exp(-3.2 * delta);
        camera.position.lerp(desiredCamPos.current, lerpFactor);
        controlsRef.current.target.lerp(_scratchTarget, lerpFactor);
      }
      controlsRef.current.update();
      return;
    }

    // Target changed: initiate smooth glide to new target
    if (lastTarget.current !== cameraTarget) {
      lastTarget.current = cameraTarget;
      isTransitioning.current = true;
      if (cameraTarget === 'overview') {
        desiredCamPos.current.set(0, 35, 55);
      } else if (cameraTarget === 'inner_solar_system') {
        desiredCamPos.current.set(0, 2.2, 3.2);
      } else {
        _scratchOffset.set(offsetDistance * 0.7, offsetDistance * 0.45, offsetDistance);
        desiredCamPos.current.copy(_scratchTarget).add(_scratchOffset);
      }
    } else if (isFollowingSpacecraft && (cameraTarget === 'voyager1' || cameraTarget === 'voyager2')) {
      // Maintain continuous lock-on offset as spacecraft moves through space
      _scratchOffset.copy(camera.position).sub(controlsRef.current.target);
      desiredCamPos.current.copy(_scratchTarget).add(_scratchOffset);
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
