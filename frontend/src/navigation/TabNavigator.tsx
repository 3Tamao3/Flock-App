import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme/ThemeContext';
import { removeToken } from '../utils/storage';
import MapScreen from '../screens/MapScreen';
import ChatListScreen from '../screens/ChatListScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  Map: undefined;
  Chats: undefined;
  History: undefined;
  Profile: undefined;
  Logout: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function TabNavigator({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60 },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Logout"
        component={MapScreen}
        options={{
          tabBarLabel: 'Logout',
          tabBarIcon: ({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => removeToken().then(() => navigation.replace('Login'))}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
