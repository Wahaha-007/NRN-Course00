// 1. ส่วนหัวใส่พื้นฐาน Library ที่ใช้ใน GUI ทั่วๆ ไป
import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/theme';

// 2. ส่วนตัวหลักจะแบ่งเป็น 3 ส่วนคือ ส่วนที่ทำงานตามช่วงชีวิตของ Component (ไม่อยากใช้คำว่า LifeCycle เดี๋ยวไปเหมือนพวก class)
export default function TemplateScreen() {

	// 2.1 พวก Trigger ตามช่วงชีวิต
	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();

	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			setNavigationParams(prev => ({ ...prev, latestPage: 'Template' }));
		}
	}, [isFocused]);

	// 2.2 พวก Function (ที่ stateless)









	// 2.3 ส่วน GUI Render, ลบทิ้งและแทนส่วนที่ต้องการ
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Template Screen</Text>
		</View>
	);
}