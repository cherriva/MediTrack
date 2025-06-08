// src/navigation/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import BuscarMedicamentoScreen from '../screens/BuscarMedicamentoScreen';
import ProgramarTomaScreen from '../screens/ProgramarTomaScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Library') icon = 'book';
          if (route.name === 'History') icon = 'time';
          if (route.name === 'BuscarMedicamento') icon = 'search';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: 'Biblioteca', tabBarLabel: 'Biblioteca' }}
      />
      <Tab.Screen
        name="BuscarMedicamento"
        component={BuscarMedicamentoScreen}
        options={{ title: 'Buscar', tabBarLabel: 'Buscar' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Historial', tabBarLabel: 'Historial' }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="AddMedicine" component={AddMedicineScreen} options={{ title: 'Nuevo medicamento' }} />
        <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} options={{ title: 'Detalle' }} />
        <Stack.Screen name="BuscarMedicamento" component={BuscarMedicamentoScreen} options={{ title: 'Buscar en CIMA' }} /> 
        <Stack.Screen name="ProgramarToma" component={ProgramarTomaScreen} options={{ title: 'Programar toma' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
