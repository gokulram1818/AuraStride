import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, showText = true }) => {
  const scale = size / 100;

  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/logo.png')} 
        style={{ width: size, height: size * 0.9, resizeMode: 'contain' }} 
      />
      
      {showText && (
        <Text style={[styles.text, { fontSize: 24 * scale }]}>
          Aura<Text style={styles.textAccent}>stride</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  text: {
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: 12,
  },
  textAccent: {
    color: '#FF5733', // Coral matching the logo
  },
});
