import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import i18n from '../i18n';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import SessionsScreen from '../screens/sessions/SessionsScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import SocialScreen from '../screens/social/SocialScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: i18n.t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarLabel: i18n.t('nav.sessions'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="video" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          tabBarLabel: i18n.t('nav.courses'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={SocialScreen}
        options={{
          tabBarLabel: i18n.t('nav.community'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: i18n.t('nav.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
