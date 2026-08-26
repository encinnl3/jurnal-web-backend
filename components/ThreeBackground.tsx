'use client'

import { Canvas } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-50">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#c49a6c" />
        
        <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
          <Sphere args={[1.5, 64, 64]} scale={2}>
            <MeshDistortMaterial color="#1c1a18" attach="material" distort={0.3} speed={0.8} roughness={0.6} metalness={0.4} />
         </Sphere>
       </Float>

        <Float speed={0.8} rotationIntensity={0.8} floatIntensity={1.2}>
          <Sphere args={[0.4, 32, 32]} position={[3, 2, -1]}>
            <MeshDistortMaterial color="#3c352e" attach="material" distort={0.2} speed={1.2} roughness={0.4} />
         </Sphere>
       </Float>
     </Canvas>
   </div>
  )
}
