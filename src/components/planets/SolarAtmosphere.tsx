import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarAtmosphereProps {
  visualRadius: number;
}

export const SolarAtmosphere: React.FC<SolarAtmosphereProps> = ({ visualRadius }) => {
  const coronaRef1 = useRef<THREE.Mesh>(null);
  const coronaRef2 = useRef<THREE.Mesh>(null);
  const flareGroupRef = useRef<THREE.Group>(null);

  // Soft Fresnel corona shader
  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color('#f59e0b') },
        coreColor: { value: new THREE.Color('#fffbeb') },
        power: { value: 2.2 },
        intensity: { value: 1.2 }
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
        uniform vec3 coreColor;
        uniform float power;
        uniform float intensity;

        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          float alpha = pow(rim, power) * intensity;
          vec3 finalColor = mix(glowColor, coreColor, pow(1.0 - rim, 3.0) * 0.4);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
  }, []);

  // Outer ethereal coronal haze
  const hazeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#ea580c') },
        power: { value: 3.5 }
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
        uniform vec3 color;
        uniform float power;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          float alpha = pow(rim, power) * 0.55;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
  }, []);

  // Gentle pulse and slow rotation of flare rays
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coronaRef1.current) {
      const s1 = 1.35 + Math.sin(t * 1.5) * 0.03;
      coronaRef1.current.scale.set(s1, s1, s1);
    }
    if (coronaRef2.current) {
      const s2 = 1.85 + Math.cos(t * 1.1) * 0.05;
      coronaRef2.current.scale.set(s2, s2, s2);
    }
    if (flareGroupRef.current) {
      flareGroupRef.current.rotation.z = t * 0.04;
    }
  });

  return (
    <group>
      {/* 1. Primary Radiant Point Light */}
      <pointLight color="#fffcf2" intensity={4.5} distance={250} decay={0.5} />

      {/* 2. Inner Brilliant Plasma Glow */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Mid-Corona with Dynamic Pulse */}
      <mesh ref={coronaRef1} scale={[1.35, 1.35, 1.35]}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <primitive object={coronaMaterial} attach="material" />
      </mesh>

      {/* 4. Outer Ethereal Coronal Haze */}
      <mesh ref={coronaRef2} scale={[1.85, 1.85, 1.85]}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <primitive object={hazeMaterial} attach="material" />
      </mesh>

      {/* 5. Subtle Cosmic Lens Diffraction Cross */}
      <group ref={flareGroupRef}>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[visualRadius * 4.5, visualRadius * 0.12]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[visualRadius * 4.5, visualRadius * 0.12]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
