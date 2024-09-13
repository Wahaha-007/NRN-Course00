import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/theme';

export default function ProductionScreen() {

	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();

	useEffect(() => {
		if (isFocused) {
			setNavigationParams(prev => ({ ...prev, latestPage: 'Production' }));
		}
	}, [isFocused]);

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Production Screen</Text>
		</View>
	);
}
