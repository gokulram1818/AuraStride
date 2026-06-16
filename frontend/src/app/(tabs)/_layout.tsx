import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { Home, Flame, Dumbbell, TrendingUp, User } from 'lucide-react-native';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TabsLayout() {
  const { theme } = useAuth();
  const isLight = theme === 'Light Theme';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00A3FF',
        tabBarInactiveTintColor: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
        tabBarStyle: [
          styles.tabBar,
          isLight && {
            backgroundColor: Platform.OS === 'ios' ? 'rgba(240, 243, 248, 0.65)' : 'rgba(228, 232, 240, 0.95)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            borderTopColor: 'rgba(0, 0, 0, 0.08)',
          }
        ],
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 95}
            tint={isLight ? 'light' : 'dark'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <Flame size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, focused }) => (
            <Dumbbell size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 24,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 16, 24, 0.4)' : 'rgba(9, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarItem: {
    height: 48,
  },
});
