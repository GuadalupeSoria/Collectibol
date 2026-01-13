import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated, Text, PanResponder, Image } from 'react-native'
import { Canvas } from '@react-three/fiber'
import { RoundedBox, Text3D, Center } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useSceneStore } from '../store/sceneStore'
import * as THREE from 'three'

const logoImg = require('../assets/logo.png')
const FONT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json'

interface Props {
  letter: string
  index: number
  total: number
  isFlipped: boolean
  dragRotation: number
  dragRotationX?: number
}

const Card3D = (props: Props) => {
  const { letter, index, total, isFlipped, dragRotation, dragRotationX } = props
  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 0.65 },
    config: { tension: 500, friction: 15 }
  })

  const limitAngle = Math.PI * 0.49
  const clampedDragY = isFlipped ? 0 : Math.max(Math.min(dragRotation, limitAngle), -limitAngle)
  const totalRotationY = clampedDragY
  const totalRotationX = isFlipped ? 0 : (dragRotationX || 0)

  const groupRef = useRef<any>(null)

  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    const checkAndFix = () => {
      g.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mat = child.material
          if (mat.type === 'ShaderMaterial') {
            const vs = (mat as any).vertexShader
            const fs = (mat as any).fragmentShader
            if (!vs || !fs) {
              child.material = new THREE.MeshBasicMaterial({ color: '#4ECDC4' })
            }
          }
        }
      })
    }
    checkAndFix()
    const id = requestAnimationFrame(() => checkAndFix())
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <animated.group ref={groupRef} scale={scale} rotation-y={totalRotationY} rotation-x={totalRotationX}>
      <RoundedBox args={[5, 7.5, 0.3]} radius={0.25} smoothness={4} position={[0, 0, -0.001]}>
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </RoundedBox>

      <group visible={!isFlipped}>
        <RoundedBox args={[5, 7.5, 0.3]} radius={0.25} smoothness={4}>
          <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
        </RoundedBox>

        <RoundedBox position={[0, 0, -0.015]} args={[5.1, 7.6, 0.32]} radius={0.26} smoothness={4}>
          <meshBasicMaterial
            attach="material"
            color="#4ECDC4"
            side={THREE.FrontSide}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </RoundedBox>

        <group position={[-1.8, 3, 0.2]}>
          <RoundedBox args={[1.2, 0.6, 0.05]} radius={0.1} smoothness={4}>
            <meshBasicMaterial color="#0a0a1a" />
          </RoundedBox>
          <RoundedBox position={[0, 0, 0.02]} args={[1.25, 0.65, 0.06]} radius={0.11} smoothness={4}>
            <meshBasicMaterial color="#4ECDC4" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
          </RoundedBox>
          <Center position={[0, 0, 0.05]}>
            <Text3D font={FONT_URL} size={0.2} height={0.02}>
              {`${index + 1}/${total}`}
              <meshBasicMaterial color="#4ECDC4" />
            </Text3D>
          </Center>
        </group>

        <Center position={[0, 0, 0.2]}>
          <Text3D
            font={FONT_URL}
            size={4.2}
            height={0.8}
          >
            {letter}
            <meshBasicMaterial color="#4ECDC4" />
          </Text3D>
        </Center>
      </group>

      <group visible={isFlipped} rotation-y={Math.PI}>
        <RoundedBox args={[5, 7.5, 0.3]} radius={0.25} smoothness={4}>
          <meshBasicMaterial color="#000000" />
        </RoundedBox>

        <RoundedBox position={[0, 0, 0.015]} args={[5.1, 7.6, 0.32]} radius={0.26} smoothness={4}>
          <meshBasicMaterial
            attach="material"
            color="#4ECDC4"
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </RoundedBox>
      </group>
    </animated.group>
  )
}

export const LetterCard = () => {
  const { objects, setLastCardAccepted } = useSceneStore()
  const [showCard, setShowCard] = useState(false)
  const [currentCardLetter, setCurrentCardLetter] = useState<string>('')
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [dragRotationY, setDragRotationY] = useState(0)
  const [dragRotationX, setDragRotationX] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const dragX = useRef(new Animated.Value(0)).current
  const dragY = useRef(new Animated.Value(0)).current
  const lastProcessedCount = useRef(0)
  const [canvasReady, setCanvasReady] = useState(false)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5
      },
      onPanResponderMove: (_, gestureState) => {
        if (isFlipped) {
          return
        }

        const rotationY = (gestureState.dx / 100)
        const rotationX = (gestureState.dy / 100)

        setDragRotationY(rotationY)
        dragX.setValue(gestureState.dx)
        setDragRotationX(rotationX)
        dragY.setValue(gestureState.dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState
        const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10

        if (isFlipped) {
          if (isTap) setIsFlipped(false)
          setDragRotationY(0)
          setDragRotationX(0)
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(dragY, { toValue: 0, useNativeDriver: true })
          ]).start()
          return
        }

        if (isTap) {
          setIsFlipped(true)
        }

        setDragRotationY(0)
        setDragRotationX(0)
        Animated.parallel([
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true })
        ]).start()
      },
    })
  ).current

  useEffect(() => {
    if (objects.length > 0 && objects.length !== lastProcessedCount.current) {
      lastProcessedCount.current = objects.length
      const word = 'COLLECTIBOL'
      const index = objects.length - 1
      const letter = word[index]

      setCurrentCardLetter(letter)
      setCurrentCardIndex(index)
      setIsFlipped(false)
      setDragRotationY(0)
      setDragRotationX(0)
      setShowCard(true)

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start()
    }
  }, [objects.length])

  useEffect(() => {
    const t = setTimeout(() => setCanvasReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCard(false)
      setIsClosing(false)

      // Si es la carta 11 (índice 10), marcar como aceptada
      if (currentCardIndex === 10) {
        setLastCardAccepted(true)
      }
    })
  }

  if (!showCard) return null

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      {...panResponder.panHandlers}
      pointerEvents="box-none"
    >
      <View style={styles.cardContainer}>
        {canvasReady ? (
          <Canvas gl={{ antialias: true }} camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />

            <React.Suspense fallback={null}>
              <Card3D
                letter={currentCardLetter}
                index={currentCardIndex}
                total={11}
                isFlipped={isFlipped}
                dragRotation={dragRotationY}
                dragRotationX={dragRotationX}
              />
            </React.Suspense>
          </Canvas>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        )}

        {isFlipped && (
          <Animated.Image
            source={logoImg}
            style={[
              styles.logoContainer
            ]}
            resizeMode="contain"
          />
        )}

        <TouchableOpacity
          style={styles.tapArea}
          onPress={() => setIsFlipped(!isFlipped)}
          activeOpacity={1}
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, isClosing && styles.disabledButton]}
        onPress={handleClose}
        activeOpacity={0.8}
        disabled={isClosing}
      >
        <Text style={styles.nextButtonText}>{isClosing ? '...' : '→ Continuar'}</Text>
      </TouchableOpacity>

      {isFlipped ? (
        <Text style={styles.instruction}>Toca la carta para volver</Text>
      ) : (
        <Text style={styles.instruction}>Arrastra 360º </Text>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignSelf: 'center',
    top: '52%',
    marginTop: -75,
  },
  tapArea: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '15%',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: '#0a0a1a',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#4ECDC4',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instruction: {
    position: 'absolute',
    top: 60,
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
})


export default LetterCard