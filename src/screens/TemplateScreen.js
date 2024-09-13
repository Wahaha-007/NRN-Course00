import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/theme';

export default function TemplateScreen() {

	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();

	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			setNavigationParams(prev => ({ ...prev, latestPage: 'Template' }));
		}
	}, [isFocused]);

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Template Screen</Text>
		</View>
	);
}