import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useEffect } from 'react'
import * as THREE from 'three'
import GoalScene from './GoalScene';

export const Scene3D = () => {

  const CameraAnimation = () => {
    const { camera } = useThree()

    useEffect(() => {
      const startPosition = new THREE.Vector3(0, 30, 25)
      const endPosition = new THREE.Vector3(0, 8, 18)
      const duration = 3000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)


        const eased = 1 - Math.pow(1 - progress, 3)

        camera.position.lerpVectors(startPosition, endPosition, eased)
        camera.lookAt(0, 1, -3)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }, [camera])

    return null
  }

  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ position: [0, 20, 25], fov: 65 }}
    >
      <CameraAnimation />

      <ambientLight intensity={0.2} color="#6699ff" />
      <directionalLight position={[10, 15, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, 15, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 8, -5]} intensity={2} color="#ffffff" distance={20} />
      <spotLight
        position={[5, 12, -5]}
        angle={0.6}
        penumbra={0.5}
        intensity={2}
        target-position={[0, 0, -5]}
      />
      <spotLight
        position={[-5, 12, -5]}
        angle={0.6}
        penumbra={0.5}
        intensity={2}
        target-position={[0, 0, -5]}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        enablePan={false}
        enableZoom={true}
        zoomSpeed={1.2}
      />

      <GoalScene />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#1a3a1a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, -1.99, 0]}>
        <ringGeometry args={[9.9, 10, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>


      <color attach="background" args={['#0a0a1a']} />

      {Array.from({ length: 500 }).map((_, i) => {
        const radius = 60 + Math.random() * 40
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta) + 10
        const z = radius * Math.cos(phi) - 20
        const size = Math.random() * 0.2 + 0.08
        const brightness = Math.random()
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 4, 4]} />
            <meshStandardMaterial
              color={brightness > 0.7 ? "#4ECDC4" : "#ffffff"}
              emissive={brightness > 0.7 ? "#4ECDC4" : "#ffffff"}
              emissiveIntensity={brightness > 0.7 ? 0.6 : 0.2}
            />
          </mesh>
        )
      })}
    </Canvas>
  )
}


export default Scene3D