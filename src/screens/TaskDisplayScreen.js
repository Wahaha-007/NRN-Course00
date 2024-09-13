import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import { View, Text, StyleSheet, FlatList, Alert, Dimensions } from 'react-native';
import axios from 'axios'; // Background Task

export default function TaskDisplayScreen() {

	const [curstation, setCurstation] = useState(''); // ใส่ว่างๆ ไว้ตอนเจออะไรครั้งแรกจะได้โหลดเลย
	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();
	const { station } = navigationParams;
	const [waitingData, setWaitingData] = useState();
	const [processingData, setProcessingData] = useState();

	useEffect(() => {
		if (isFocused && station != curstation && station != undefined) {
			console.log("New station detect :", station);
			setCurstation(station);

			const fetchData = async () => {
				try {

					// --- Upper table : xxx Waiting ---
					const message1 = {
						queryName: 'waitingIncoming',
						params: { "nextStation": station } // ค่าใหม่จาก Context สดๆ ร้อนๆ
					}

					const result1 = await axios.post('http://192.168.1.43:5011/query', message1);
					if (result1 && result1.data) {
						console.log("Query result:", result1.data);
						setWaitingData(result1.data);
					}

					// --- Lower table : xxx Processing ---
					const message2 = {
						queryName: 'orderprocessingInStation',
						params: { "station": station } // ค่าใหม่จาก Context สดๆ ร้อนๆ
					}

					const result2 = await axios.post('http://192.168.1.43:5011/query', message2);
					if (result2 && result2.data) {
						console.log("Query result:", result2.data);
						setProcessingData(result2.data);
					}

				} catch (error) {
					console.error(error);
					Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
				}
			};
			fetchData();

			setNavigationParams(prev => ({ ...prev, latestPage: 'TaskDisplay' }));
		}
	}, [isFocused]);


	// // Mock data provider for the 'up table'
	// const getUpTableData = () => {
	// 	return [
	// 		['1001', 'Station A', 5],
	// 		['1002', 'Station B', 10],
	// 		['1003', 'Station C', 7],
	// 	]; // 2D array format
	// };

	// // Mock data provider for the 'down table' (2D array)
	// const getDownTableData = () => {
	// 	return [
	// 		['1001', 8, 2],
	// 		['1002', 15, 0],
	// 		['1003', 9, 1],
	// 	]; // 2D array format
	// };

	// Get data from mock data providers
	const upTableData = waitingData;
	const downTableData = processingData;

	// Calculate Var1 (sum of Qty in 'up table') and Var2 (sum of Qty in 'down table')
	const var1 = upTableData?.reduce((sum, row) => sum + row[2], 0); // Sum of 'Qty' column (index 2)
	const var2 = downTableData?.reduce((sum, row) => sum + row[1], 0); // Sum of 'Qty' column (index 1)

	// Render each row for 'up table' (from 2D array)
	const renderUpTableRow = ({ item }) => (
		<View style={styles.tableRow}>
			<Text style={styles.tableCell}>{item[0]}</Text>
			<Text style={styles.tableCell}>{item[1]}</Text>
			<Text style={styles.tableCell}>{item[2]}</Text>
		</View>
	);

	// Render each row for 'down table' (from 2D array)
	const renderDownTableRow = ({ item }) => (
		<View style={styles.tableRow}>
			<Text style={styles.tableCell}>{item[0]}</Text>
			<Text style={styles.tableCell}>{item[1]}</Text>
			<Text style={styles.tableCell}>{item[2]}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				{/* Upper Section */}
				<View style={styles.section}>
					<Text style={styles.sectionText}>{var1} Waiting</Text>
					{/* 'Up Table' */}
					<View style={styles.tableContainer}>
						<View style={styles.tableHeader}>
							<Text style={styles.tableHeaderCell}>Order ID</Text>
							<Text style={styles.tableHeaderCell}>Station</Text>
							<Text style={styles.tableHeaderCell}>Qty</Text>
						</View>
						<FlatList
							data={upTableData}
							renderItem={renderUpTableRow}
							keyExtractor={(item, index) => index.toString()}
						/>
					</View>
				</View>

				{/* Lower Section */}
				<View style={styles.section}>
					<Text style={styles.sectionText}>{var2} Processing</Text>
					{/* 'Down Table' */}
					<View style={styles.tableContainer}>
						<View style={styles.tableHeader}>
							<Text style={styles.tableHeaderCell}>Order ID</Text>
							<Text style={styles.tableHeaderCell}>Qty</Text>
							<Text style={styles.tableHeaderCell}>Breakage</Text>
						</View>
						<FlatList
							data={downTableData}
							renderItem={renderDownTableRow}
							keyExtractor={(item, index) => index.toString()}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};


// Black Theme Stylesheet
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000', // Black background
		padding: 5,
	},
	card: {
		flex: 1,
		backgroundColor: '#222',
		borderRadius: 8,
		padding: 5,
		marginBottom: 5,
	},
	section: {
		flex: 1, // Take half of the screen
		padding: 10,
		justifyContent: 'center',
	},
	sectionText: {
		color: '#fff', // White text for contrast
		fontSize: 20,
		textAlign: 'center',
		marginBottom: 10,
	},
	tableContainer: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#fff', // White borders for visibility
	},
	tableHeader: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: '#fff',
	},
	tableHeaderCell: {
		flex: 1,
		color: '#fff',
		textAlign: 'center',
		padding: 5,
		fontWeight: 'bold',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: '#333',
	},
	tableCell: {
		flex: 1,
		color: '#fff',
		textAlign: 'center',
		padding: 5,
	},
});

