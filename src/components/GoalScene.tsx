import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore, ObjectParams } from '../store/sceneStore'
import { animated, useSpring } from '@react-spring/three'
import { Center, Text3D } from '@react-three/drei'

const FONT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json'

const SoccerBall = () => {
    const meshRef = useRef<any>(null)
    const { touchTarget, addObject, shootBall } = useSceneStore()
    const [isAnimating, setIsAnimating] = useState(false)
    const animationProgress = useRef(0)
    const currentTarget = useRef<[number, number, number] | null>(null)
    const startPosition = useRef<[number, number, number]>([0, -1, 5])
    const lastShotId = useRef<string>('')

    useEffect(() => {
        if (touchTarget && !isAnimating) {
            const currentShotId = JSON.stringify(touchTarget)
            if (currentShotId !== lastShotId.current) {
                lastShotId.current = currentShotId
                setIsAnimating(true)
                animationProgress.current = 0
                currentTarget.current = touchTarget
                startPosition.current = meshRef.current?.position.toArray() as [number, number, number] || [0, -1, 5]
            }
        }
    }, [touchTarget, isAnimating])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        if (isAnimating && currentTarget.current) {
            animationProgress.current += delta * 1.5

            if (animationProgress.current >= 1) {
                const target = currentTarget.current
                if (Math.abs(target[0]) <= 3 && target[1] >= 0.2 && target[1] <= 3) {
                    createProceduralLetter(target, addObject)
                }
                animationProgress.current = 0
                setIsAnimating(false)
                currentTarget.current = null
                meshRef.current.position.set(0, -1, 5)
                meshRef.current.scale.setScalar(1)
            } else {
                const t = animationProgress.current
                const start = startPosition.current
                const end = currentTarget.current
                const x = start[0] + (end[0] - start[0]) * t
                const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 2
                const z = start[2] + (end[2] - start[2]) * t
                meshRef.current.position.set(x, y, z)
                const scale = 1 - t * 0.5
                meshRef.current.scale.setScalar(scale)
            }
        } else if (!isAnimating) {
            meshRef.current.position.set(0, -1, 5)
            meshRef.current.scale.setScalar(1)
        }
    })

    const handlePointerDown = (e: any) => {
        if (isAnimating) return
        e.stopPropagation()
    }

    const handlePointerUp = (e: any) => {
        if (!isAnimating) e.stopPropagation()
        const randomX = (Math.random() - 0.5) * 3
        const randomY = 0.8 + Math.random() * 1.5
        shootBall([randomX, randomY, -5])
    }

    return (
        <group
            ref={meshRef}
            position={[0, -1, 5]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <mesh>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>
        </group>
    )
}

const createProceduralLetter = (
    position: [number, number, number],
    addObject: (obj: ObjectParams) => void
) => {
    const word = 'COLLECTIBOL'
    const existingCount = useSceneStore.getState().objects.length

    if (existingCount >= word.length) return

    const scale = 0.8 + Math.random() * 0.4
    const animationTypes: Array<'rotate' | 'float' | 'pulse' | null> = ['rotate', 'float', 'pulse', null]
    const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)]

    const letterObj: ObjectParams = {
        id: `letter-${existingCount}-${Date.now()}`,
        type: 'box',
        position: [0, 4, -5],
        rotation: [
            Math.random() * 0.2 - 0.1,
            Math.random() * 0.2 - 0.1,
            Math.random() * 0.2 - 0.1
        ],
        scale: [scale, scale, scale],
        color: '#4ECDC4',
        roughness: 0.2 + Math.random() * 0.3,
        metalness: 0.4 + Math.random() * 0.4,
        animationType,
        animationSpeed: 0.5 + Math.random() * 1,
        createdAt: Date.now(),
    }

    addObject(letterObj)
}

const ProceduralLetter = ({
    params,
    isSelected,
    onSelect
}: {
    params: ObjectParams
    isSelected: boolean
    onSelect: () => void
}) => {
    const groupRef = useRef<any>(null)
    const word = 'COLLECTIBOL'
    const index = useSceneStore.getState().objects.findIndex(obj => obj.id === params.id)
    const char = word[index] || '?'

    const [hovered, setHovered] = React.useState(false)
    const [hasAnimated, setHasAnimated] = React.useState(false)
    const animProgress = useRef(0)

    const finalPosition: [number, number, number] = [
        (index - word.length / 2) * 1.2,
        4,
        -5
    ]

    const { scale } = useSpring({
        scale: isSelected ? 2 : (hovered ? 1.5 : 1),
        config: { tension: 300, friction: 20 },
    })

    useFrame((state, delta) => {
        if (!groupRef.current) return

        if (!hasAnimated && animProgress.current < 1) {
            animProgress.current += delta * 1.5
            const t = Math.min(animProgress.current, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            groupRef.current.position.x = params.position[0] + (finalPosition[0] - params.position[0]) * eased
            groupRef.current.position.y = params.position[1] + (finalPosition[1] - params.position[1]) * eased
            if (t >= 1) {
                setHasAnimated(true)
            }
        }

        if (isSelected) {
            groupRef.current.rotation.y += 0.03
        } else if (hasAnimated) {
            if (params.animationType === 'rotate') {
                groupRef.current.rotation.y += 0.01 * params.animationSpeed
            } else if (params.animationType === 'float') {
                groupRef.current.position.y = finalPosition[1] + Math.sin(state.clock.elapsedTime * params.animationSpeed) * 0.2
            } else if (params.animationType === 'pulse') {
                const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * params.animationSpeed * 2) * 0.1
                groupRef.current.scale.setScalar(pulseFactor)
            }
        }
    })

    const handlePointerDown = (e: any) => {
        e.stopPropagation()
        onSelect()
    }

    return (
        <animated.group
            ref={groupRef}
            position={params.position}
            rotation={params.rotation}
            scale={scale}
        >
            <mesh
                onClick={handlePointerDown}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                visible={false}
            >
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {hovered && (
                <mesh position={[0, 0, -0.2]}>
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshBasicMaterial
                        color="#4ECDC4"
                        transparent
                        opacity={0.3}
                    />
                </mesh>
            )}

            <Center>
                <Text3D
                    font={FONT_URL}
                    size={0.82}
                    height={0.31}
                >
                    {char}
                    <meshBasicMaterial
                        color="#4ECDC4"
                        transparent
                        opacity={0.4}
                        wireframe={true}
                    />
                </Text3D>
            </Center>
            <Center>
                <Text3D
                    font={FONT_URL}
                    size={0.8}
                    height={0.3}
                >
                    {char}
                    <meshStandardMaterial
                        color={isSelected ? '#FFD700' : params.color}
                        metalness={isSelected ? 0.3 : 0.2}
                        roughness={isSelected ? 0.3 : params.roughness}
                    />
                </Text3D>
            </Center>
        </animated.group>
    )
}

const Goal = () => {
    return (
        <group position={[0, 0, -5]}>
            <mesh position={[0, 1.5, 0.3]}>
                <planeGeometry args={[6, 3, 16, 6]} />
                <meshBasicMaterial
                    color="#ffffff"
                    wireframe={true}
                    opacity={0.8}
                />
            </mesh>

            <mesh position={[-3, 1.5, 0.5]}>
                <cylinderGeometry args={[0.08, 0.08, 3, 16]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>

            <mesh position={[3, 1.5, 0.5]}>
                <cylinderGeometry args={[0.08, 0.08, 3, 16]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>

            <mesh position={[0, 3, 0.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 6, 16]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>

            <group position={[-8, 0, -8]}>
                <mesh position={[0, 4, 0]}>
                    <cylinderGeometry args={[0.15, 0.2, 12, 8]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 10, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.8]} />
                    <meshBasicMaterial color="#ffff99" />
                </mesh>
            </group>

            <group position={[8, 0, -8]}>
                <mesh position={[0, 4, 0]}>
                    <cylinderGeometry args={[0.15, 0.2, 12, 8]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 10, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.8]} />
                    <meshBasicMaterial color="#ffff99" />
                </mesh>
            </group>
        </group>
    )
}

export const GoalScene = () => {
    const { objects, selectedObjectId, selectObject, shootBall } = useSceneStore()

    const handleGoalTouch = (event: any) => {
        event.stopPropagation()
        const point = event.point
        const targetX = Math.max(-2.8, Math.min(2.8, point.x))
        const targetY = Math.max(0.5, Math.min(2.8, point.y))
        shootBall([targetX, targetY, -5])
    }

    return (
        <group>
            <mesh
                position={[0, 1.5, -5]}
                rotation={[0, 0, 0]}
                onClick={handleGoalTouch}
                onPointerDown={handleGoalTouch}
                visible={false}
            >
                <planeGeometry args={[6, 3]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <group position={[0, 1.5, -5]}>
                <lineSegments>
                    <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(6, 3)]} />
                    <lineBasicMaterial attach="material" color="#4ECDC4" opacity={0.3} transparent />
                </lineSegments>
            </group>

            <Goal />
            <SoccerBall />

            {objects.map((obj) => (
                <ProceduralLetter
                    key={obj.id}
                    params={obj}
                    isSelected={obj.id === selectedObjectId}
                    onSelect={() => selectObject(obj.id)}
                />
            ))}
        </group>
    )
}

export default GoalScene
