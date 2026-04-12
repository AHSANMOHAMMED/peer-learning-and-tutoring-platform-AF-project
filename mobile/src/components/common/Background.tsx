import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface BackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}

export default function Background({ children, colors = ['#4f46e5', '#7c3aed'] }: BackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Dynamic light orbs for aesthetic depth */}
      <View style={[styles.orb, { top: -50, right: -50, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.orb, { bottom: -100, left: -60, backgroundColor: 'rgba(255,255,255,0.05)', width: 300, height: 300 }]} />
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  orb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 150,
    zIndex: 0,
  },
});
