import React, { useMemo } from 'react';
import * as THREE from 'three';

interface AtmosphereGlowProps {
  radius: number;
  color: string;
  scale?: number;
  power?: number;
  intensity?: number;
}

export const AtmosphereGlow: React.FC<AtmosphereGlowProps> = ({
  radius,
  color,
  scale = 1.08,
  power = 3.2,
  intensity = 0.85
}) => {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        power: { value: power },
        intensity: { value: intensity }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float power;
        uniform float intensity;

        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          float alpha = pow(rim, power) * intensity;
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
  }, [color, power, intensity]);

  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
