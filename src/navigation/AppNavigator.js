import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ProductionScreen from '../screens/ProductionScreen';
import ScannerScreen from '../screens/ScannerScreen';
import CameraScreen from '../screens/CameraScreen';
import MachineScreen from '../screens/MachineScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
import { styles } from '../styles/theme'; // Black theme styles

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => { // อันนี้คือกำลังทำทีละปุ่มเลยนะ
					let iconName;
					let iconSize = focused ? 30 : 24; // Change the size here
					let iconColor = focused ? 'white' : 'gray'; // Change color based on focus

					if (route.name === 'Home') {
						iconName = 'home'; // Material icon name for Home
					} else if (route.name === 'Production') {
						iconName = 'build'; // Material icon name for Production
					} else if (route.name === 'Scanner') {
						iconName = 'qr-code-scanner'; // Material icon name for Scanner
					} else if (route.name === 'Machine') {
						iconName = 'memory'; // Material icon name for Machine
					} else if (route.name === 'Settings') {
						iconName = 'settings'; // Material icon name for Settings
					}

					// Return the MaterialIcon with size and color passed as props
					return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
					//return How <MaterialIcons name={iconName} size={28} color={color} /> // Set size to 28 for all icons

				},
				// tabBarActiveTintColor: 'white', // Fix icon color for all by sending 'color' to tabBarIcon
				// tabBarInactiveTintColor: 'gray', // Fix icon color for all by sending 'color' to tabBarIcon
				tabBarStyle: styles.tabBarStyle,
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Production" component={ProductionScreen} />
			<Tab.Screen name="Scanner" component={ScannerScreen} />
			<Tab.Screen name="Machine" component={MachineScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
}

export default function AppNavigator() {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
				<Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
