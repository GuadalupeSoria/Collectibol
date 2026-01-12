import React, { useEffect } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSceneStore } from '../store/sceneStore'

export const ControlPanel = () => {
    const { clearAllObjects, objects, selectedObjectId, selectObject } = useSceneStore()
    const [isMinimized, setIsMinimized] = React.useState(true)
    const [isProcessing, setIsProcessing] = React.useState(false)
    const slideAnim = React.useRef(new Animated.Value(0)).current

    const handleClearAll = async () => {
        if (isProcessing) return
        setIsProcessing(true)
        clearAllObjects()
        setTimeout(() => setIsProcessing(false), 300)
    }

    const handleDeselectLetter = () => {
        if (isProcessing) return
        selectObject(null)
    }

    const selectedObject = objects.find(obj => obj.id === selectedObjectId)

    useEffect(() => {
        if (selectedObjectId && isMinimized) {
            togglePanel()
        }
    }, [selectedObjectId])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isMinimized) {
                togglePanel()
            }
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    const togglePanel = () => {
        const newState = !isMinimized
        setIsMinimized(newState)
        Animated.spring(slideAnim, {
            toValue: newState ? 0 : 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start()
        if (newState) {
            selectObject(null)
        }
    }

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [180, 0],
    })

    return (
        <SafeAreaView edges={['bottom']} style={styles.container}>
            <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={togglePanel}
                    activeOpacity={0.7}
                >
                    <Text style={styles.toggleIcon}>{isMinimized ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>⚽ COLLECTIBOL</Text>
                    <Text style={styles.counter}>Letras: {objects.length} / 11</Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoText}>
                        Toca en el arco o pelota para disparar • Toca letras para seleccionarlas
                    </Text>

                    {selectedObject && (
                        <View style={styles.selectedInfo}>
                            <View style={styles.selectedHeader}>
                                <Text style={styles.selectedTitle}>Letra seleccionada:</Text>
                                <TouchableOpacity
                                    onPress={handleDeselectLetter}
                                    style={styles.deselectButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.deselectButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.selectedDetail}>ID: {selectedObject.id}</Text>
                            <Text style={styles.selectedDetail}>Color: {selectedObject.color}</Text>
                            <Text style={styles.selectedDetail}>Escala: {selectedObject.scale.join(', ')}</Text>
                            <Text style={styles.selectedDetail}>Animación: {selectedObject.animationType || 'ninguna'}</Text>
                            <Text style={styles.selectedDetail}>Metalness: {selectedObject.metalness}</Text>
                            <Text style={styles.selectedDetail}>Roughness: {selectedObject.roughness}</Text>
                        </View>
                    )}
                </View>

                {objects.length > 0 && (
                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton, isProcessing && styles.disabledButton]}
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                        disabled={isProcessing}
                    >
                        <Text style={styles.buttonText}>{isProcessing ? '...' : 'Reiniciar Juego'}</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </SafeAreaView>
    )
}

export default ControlPanel

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    panel: {
        backgroundColor: '#0a0a1a',
        padding: 20,
        paddingTop: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderColor: '#4ECDC4',
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    toggleButton: {
        position: 'absolute',
        top: -35,
        right: 20,
        backgroundColor: '#0a0a1a',
        width: 50,
        height: 35,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: '#4ECDC4',
    },
    toggleIcon: {
        fontSize: 18,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    counter: {
        fontSize: 16,
        color: '#4ECDC4',
        fontWeight: '600',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerButton: {
        backgroundColor: '#E56B6F',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    info: {
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 5,
    },
    selectedInfo: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4ECDC4',
    },
    selectedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    selectedTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    deselectButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deselectButtonText: {
        fontSize: 20,
        color: '#E56B6F',
        fontWeight: 'bold',
    },
    selectedDetail: {
        fontSize: 11,
        color: '#ddd',
        marginVertical: 2,
    },
})
