import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ControlPanel } from '../src/components/ControlPanel';
import { Scene3D } from '../src/components/Scene3D';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Scene3D />
      <ControlPanel />
      {/*   <LetterCardOverlay /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
