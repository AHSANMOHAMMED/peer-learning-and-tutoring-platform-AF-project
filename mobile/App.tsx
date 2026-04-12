import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from './src/store/authStore';
import { useNotificationStore } from './src/store/notificationStore';
import i18n, { initializeLanguage } from './src/i18n';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import PeerMatchingScreen from './src/screens/sessions/PeerMatchingScreen';
import SessionRoomScreen from './src/screens/sessions/SessionRoomScreen';
import AIHomeworkScreen from './src/screens/ai/AIHomeworkScreen';
import CourseDetailScreen from './src/screens/courses/CourseDetailScreen';
import ProfileScreen from './src/screens/social/ProfileScreen';
import StudyPlannerScreen from './src/screens/planner/StudyPlannerScreen';
import VoiceTutorScreen from './src/screens/ai/VoiceTutorScreen';

const Stack = createStackNavigator();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3b82f6',
    accent: '#8b5cf6',
  },
};

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, initializeAuth } = useAuthStore();
  const { registerForPushNotifications } = useNotificationStore();
  // Force re-render when language changes
  const [, setLangTick] = useState(0);

  useEffect(() => {
    // Initialize language preference before anything else
    initializeLanguage().then(() => {
      setLangTick((t) => t + 1);
    });

    // Initialize auth state
    initializeAuth().then(() => {
      setIsLoading(false);
    });

    // Register for push notifications
    registerForPushNotifications();

    // Notification listeners
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to relevant screen
      console.log('Notification tapped:', data);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (isLoading) {
    return null; // Or return a loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!user ? (
            // Auth Stack
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen 
                name="PeerMatching" 
                component={PeerMatchingScreen}
                options={{ headerShown: true, title: i18n.t('screens.find_tutor') }}
              />
              <Stack.Screen 
                name="SessionRoom" 
                component={SessionRoomScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AIHomework" 
                component={AIHomeworkScreen}
                options={{ headerShown: true, title: i18n.t('screens.ai_homework') }}
              />
              <Stack.Screen 
                name="CourseDetail" 
                component={CourseDetailScreen}
                options={{ headerShown: true, title: i18n.t('screens.course_details') }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ headerShown: true, title: i18n.t('screens.profile') }}
              />
              <Stack.Screen 
                name="StudyPlanner" 
                component={StudyPlannerScreen}
                options={{ headerShown: true, title: i18n.t('screens.study_planner') }}
              />
              <Stack.Screen 
                name="VoiceTutor" 
                component={VoiceTutorScreen}
                options={{ headerShown: true, title: i18n.t('screens.voice_tutor') }}
              />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}

registerRootComponent(App);
