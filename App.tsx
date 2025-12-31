import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from './src/store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MachineDetailScreen from './src/screens/MachineDetailScreen';
import DowntimeCaptureScreen from './src/screens/DowntimeCaptureScreen';
import MaintenanceChecklistScreen from './src/screens/MaintenanceChecklistScreen';
import AlertManagementScreen from './src/screens/AlertManagementScreen';
import SummaryReportsScreen from './src/screens/SummaryReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function OperatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Machines' }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryReportsScreen}
        options={{ tabBarLabel: 'Summary' }}
      />
    </Tab.Navigator>
  );
}

function SupervisorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Machines' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertManagementScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryReportsScreen}
        options={{ tabBarLabel: 'Summary' }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const user = useStore((state) => state.user);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={user?.role === 'Supervisor' ? SupervisorTabs : OperatorTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MachineDetail"
        component={MachineDetailScreen}
        options={{ title: 'Machine Details' }}
      />
      <Stack.Screen
        name="DowntimeCapture"
        component={DowntimeCaptureScreen}
        options={{ title: 'Downtime Capture' }}
      />
      <Stack.Screen
        name="MaintenanceChecklist"
        component={MaintenanceChecklistScreen}
        options={{ title: 'Maintenance' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const initialize = useStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <LoginScreen />}
    </NavigationContainer>
  );
}
