import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function EntryPoint() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00A3FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
