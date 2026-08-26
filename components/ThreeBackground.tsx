'use client'

import { Canvas } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{background: '#0c0a09'}}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#d97706" />
        
        <Float speed={1.4} rotationIntensity={1.5} floatIntensity={2}>
          <Sphere args={[1.5, 128, 128]} scale={1.8}>
            <MeshDistortMaterial
              color="#1c1917"
              attach="material"
              distort={0.3}
              speed={1.2}
              roughness={0.4}
              metalness={0.6}
            />
          </Sphere>
        </Float>

        <Float speed={0.8} rotationIntensity={1} floatIntensity={1.5}>
          <Sphere args={[0.4, 64, 64]} position={[3, 2, -1]}>
            <MeshDistortMaterial
              color="#d97706"
              attach="material"
              distort={0.2}
              speed={2}
              roughness={0.1}
              metalness={0.8}
            />
          </Sphere>
        </Float>

        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1}>
          <Sphere args={[0.25, 64, 64]} position={[-3, -1.5, -2]}>
            <MeshDistortMaterial
              color="#92400e"
              attach="material"
              distort={0.4}
              speed={3}
              roughness={0.2}
            />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  )
}
