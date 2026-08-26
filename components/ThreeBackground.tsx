'use client'

import { Canvas } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei'

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-80">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#d4a373" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a68b5b" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1.4} rotationIntensity={2} floatIntensity={3}>
          <Sphere args={[1.5, 128, 128]} scale={2.5}>
            <MeshDistortMaterial color="#1c1a18" attach="material" distort={0.4} speed={1.5} roughness={0.2} metalness={0.8} />
          </Sphere>
        </Float>

        <Float speed={1.2} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[0.6, 64, 64]} position={[4, -2, -3]}>
            <MeshDistortMaterial color="#d4a373" attach="material" distort={0.3} speed={2} roughness={0.1} metalness={0.9} />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  )
}
