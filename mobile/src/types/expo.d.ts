/// <reference types="react" />
/// <reference types="react-native" />

declare module 'expo' {
  export function registerRootComponent(component: React.ComponentType<any>): void;
}

declare module 'expo-status-bar' {
  import { ViewProps } from 'react-native';
  export function StatusBar(props: { style?: 'auto' | 'inverted' | 'light' | 'dark' } & ViewProps): JSX.Element;
}

declare module 'expo-notifications' {
  export interface Notification {
    request: {
      content: {
        data: any;
        title?: string;
        body?: string;
      };
    };
  }
  
  export interface NotificationResponse {
    notification: Notification;
  }
  
  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
  
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getExpoPushTokenAsync(): Promise<{ data: string }>;
  export function addNotificationReceivedListener(listener: (notification: Notification) => void): { remove: () => void };
  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): { remove: () => void };
  export function scheduleNotificationAsync(options: any): Promise<string>;
}

declare module 'expo-device' {
  export const isDevice: boolean;
}

declare module 'expo-speech' {
  export function speak(text: string, options?: any): void;
  export function stop(): void;
}

declare module 'expo-asset' {
  export interface Asset {
    uri: string;
  }
}

declare module 'expo-font' {
  export function loadAsync(fontMap: Record<string, any>): Promise<void>;
}

declare module 'expo-splash-screen' {
  export function preventAutoHideAsync(): Promise<void>;
  export function hideAsync(): Promise<void>;
}
