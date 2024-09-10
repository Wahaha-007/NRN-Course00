import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/theme'; // Import black theme styles

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Home Screen</Text>
		</View>
	);
}
