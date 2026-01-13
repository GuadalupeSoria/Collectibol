import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ObjectParams {
    id: string
    type: 'box' | 'sphere' | 'torus' | 'cone'
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
    color: string
    roughness: number
    metalness: number
    animationType?: 'rotate' | 'float' | 'pulse' | null
    animationSpeed: number
    createdAt: number
}

interface SceneState {
    objects: ObjectParams[]
    selectedObjectId: string | null
    shotCount: number
    touchTarget: [number, number, number] | null
    lastCardAccepted: boolean
    addObject: (obj: ObjectParams) => void
    removeObject: (id: string) => void
    clearAllObjects: () => void
    selectObject: (id: string | null) => void
    updateObject: (id: string, updates: Partial<ObjectParams>) => void
    shootBall: (target: [number, number, number]) => void
    setTouchTarget: (target: [number, number, number] | null) => void
    setLastCardAccepted: (accepted: boolean) => void
}

export const useSceneStore = create<SceneState>()(
    persist(
        (set, get) => ({
            objects: [],
            selectedObjectId: null,
            shotCount: 0,
            touchTarget: null,
            lastCardAccepted: false,

            setTouchTarget: (target) => {
                set({ touchTarget: target })
            },

            shootBall: (target) => {
                set((state) => ({
                    shotCount: state.shotCount + 1,
                    touchTarget: target
                }))
            },

            addObject: (obj) => {
                set((state) => ({
                    objects: [...state.objects, obj]
                }))
            },

            removeObject: (id) => {
                set((state) => ({
                    objects: state.objects.filter((obj) => obj.id !== id),
                    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
                }))
            },

            clearAllObjects: () => {
                set({ objects: [], selectedObjectId: null, lastCardAccepted: false })
            },

            selectObject: (id) => {
                set({ selectedObjectId: id })
            },

            updateObject: (id, updates) => {
                set((state) => ({
                    objects: state.objects.map((obj) =>
                        obj.id === id ? { ...obj, ...updates } : obj
                    )
                }))
            },

            setLastCardAccepted: (accepted) => {
                set({ lastCardAccepted: accepted })
            }
        }),
        {
            name: 'scene-storage',
            storage: createJSONStorage(() => AsyncStorage),
            skipHydration: false,
            partialize: (state) => ({
                objects: state.objects,
                shotCount: state.shotCount,
            }),
            onRehydrateStorage: () => (state) => {
                if (state && state.objects.length > 0) {
                    setTimeout(() => {
                        state.objects = state.objects.map((obj) => ({
                            ...obj,
                            position: [0, 4, -5] as [number, number, number],
                            createdAt: Date.now(),
                        }))
                    }, 100)
                }
            },
        }
    )
)
