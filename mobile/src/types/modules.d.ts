/// <reference types="react" />
/// <reference types="react-native" />

declare module '@react-navigation/native' {
  import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
  export { NavigationContainer, useNavigation, useRoute };
  
  export type RouteProp<ParamList extends Record<string, any>, RouteName extends keyof ParamList> = {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  };
}

declare module '@react-navigation/stack' {
  import { createStackNavigator, StackScreenProps, StackNavigationProp } from '@react-navigation/stack';
  export { createStackNavigator, StackScreenProps, StackNavigationProp };
}

declare module '@react-navigation/bottom-tabs' {
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  export { createBottomTabNavigator };
}

declare module 'react-native-paper' {
  import * as React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';
  
  export interface Theme {
    colors: {
      primary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      error: string;
      disabled: string;
      placeholder: string;
      backdrop: string;
    };
    fonts: any;
    animation: any;
  }
  
  export const DefaultTheme: Theme;
  export const Provider: React.FC<{ theme?: Theme; children: React.ReactNode }>;
  
  export interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
    onPress?: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    labelStyle?: TextStyle;
    compact?: boolean;
    children?: React.ReactNode;
  }
  export const Button: React.FC<ButtonProps>;
  
  export interface CardProps {
    style?: ViewStyle;
    onPress?: () => void;
    children?: React.ReactNode;
  }
  export const Card: React.FC<CardProps> & {
    Title: React.FC<{ title: string; subtitle?: string; right?: () => React.ReactNode }>;
    Content: React.FC<{ children: React.ReactNode }>;
    Actions: React.FC<{ children: React.ReactNode }>;
    Cover: React.FC<{ source: { uri: string }; style?: ViewStyle }>;
  };
  
  export interface TextInputProps {
    label?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
    style?: ViewStyle;
    mode?: 'flat' | 'outlined';
    right?: React.ReactNode;
    multiline?: boolean;
    maxLength?: number;
    placeholder?: string;
    editable?: boolean;
  }
  export const TextInput: React.FC<TextInputProps> & {
    Icon: React.FC<{ icon: string; onPress?: () => void }>;
  };
  
  export interface TextProps {
    style?: TextStyle;
    children?: React.ReactNode;
    numberOfLines?: number;
  }
  export const Text: React.FC<TextProps>;
  
  export interface SearchbarProps {
    placeholder?: string;
    onChangeText?: (text: string) => void;
    value?: string;
    onSubmitEditing?: () => void;
    style?: ViewStyle;
  }
  export const Searchbar: React.FC<SearchbarProps>;
  
  export interface ChipProps {
    selected?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
    icon?: string;
    compact?: boolean;
    children?: React.ReactNode;
  }
  export const Chip: React.FC<ChipProps>;
  
  export interface AvatarProps {
    size?: number;
    label?: string;
    icon?: string;
    style?: ViewStyle;
    source?: { uri: string };
  }
  export const Avatar: {
    Text: React.FC<AvatarProps>;
    Icon: React.FC<AvatarProps>;
    Image: React.FC<AvatarProps>;
  };
  
  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    style?: ViewStyle;
  }
  export const ActivityIndicator: React.FC<ActivityIndicatorProps>;
  
  export interface SurfaceProps {
    style?: ViewStyle;
    elevation?: number;
    children?: React.ReactNode;
  }
  export const Surface: React.FC<SurfaceProps>;
  
  export interface MenuProps {
    visible: boolean;
    onDismiss: () => void;
    anchor: React.ReactNode;
    children?: React.ReactNode;
  }
  export const Menu: React.FC<MenuProps> & {
    Item: React.FC<{ onPress?: () => void; title: string }>;
  };
  
  export interface DividerProps {
    style?: ViewStyle;
  }
  export const Divider: React.FC<DividerProps>;
  
  export interface ListProps {
    children?: React.ReactNode;
  }
  export const List: {
    Section: React.FC<ListProps>;
    Item: React.FC<{ title: string; description?: string; left?: (props: any) => React.ReactNode; onPress?: () => void }>;
    Icon: React.FC<{ icon: string; color?: string }>;
  };
  
  export interface BadgeProps {
    style?: ViewStyle;
    children?: React.ReactNode;
  }
  export const Badge: React.FC<BadgeProps>;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
    multiRemove(keys: string[]): Promise<void>;
    getAllKeys(): Promise<string[]>;
  };
  export default AsyncStorage;
}

declare module '@expo/vector-icons' {
  import * as React from 'react';
  
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const MaterialCommunityIcons: React.FC<IconProps>;
  export const Ionicons: React.FC<IconProps>;
  export const FontAwesome: React.FC<IconProps>;
  export const MaterialIcons: React.FC<IconProps>;
  export const Feather: React.FC<IconProps>;
  export const Entypo: React.FC<IconProps>;
  export const AntDesign: React.FC<IconProps>;
}

declare module 'react-native-webview' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';
  
  export interface WebViewProps {
    source: { uri: string } | { html: string };
    style?: ViewStyle;
    onLoad?: () => void;
    onError?: (error: any) => void;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    allowsInlineMediaPlayback?: boolean;
    mediaPlaybackRequiresUserAction?: boolean;
  }
  
  export const WebView: React.FC<WebViewProps>;
}

declare module 'zustand' {
  import * as React from 'react';
  
  export type SetState<T> = (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean
  ) => void;
  
  export type GetState<T> = () => T;
  
  export type StoreApi<T> = {
    setState: SetState<T>;
    getState: GetState<T>;
    subscribe: (listener: (state: T) => void) => () => void;
  };
  
  export function create<T>(
    createState: (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T
  ): () => T;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    params?: any;
    data?: any;
    timeout?: number;
  }
  
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
  }
  
  export interface AxiosError<T = any> extends Error {
    response?: AxiosResponse<T>;
    request?: any;
    config: AxiosRequestConfig;
  }
  
  export interface AxiosInstance {
    defaults: {
      headers: {
        common: Record<string, string>;
      };
    };
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    interceptors: {
      request: {
        use(
          onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
          onRejected?: (error: any) => any
        ): number;
      };
      response: {
        use(
          onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
          onRejected?: (error: any) => any
        ): number;
      };
    };
  }
  
  const axios: {
    create(config?: AxiosRequestConfig): AxiosInstance;
  } & AxiosInstance;
  
  export default axios;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
