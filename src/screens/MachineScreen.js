import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import io from 'socket.io-client';
import { Table, Row, Rows } from 'react-native-table-component';

const screenWidth = Dimensions.get('window').width;

const MachineScreen = () => {
	const [tableData, setTableData] = useState([]);
	const [sinceTimes, setSinceTimes] = useState([]);
	const [clock, setClock] = useState('');
	const [animatedValue] = useState(new Animated.Value(0));
	const [inited, setInited] = useState(false);

	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();

	useEffect(() => {
		if (isFocused) {
			setNavigationParams(prev => ({ ...prev, latestPage: 'Machine' }));
		}
	}, [isFocused]);

	useEffect(() => {
		// Initialize WebSocket connection
		const socket = io('ws://192.168.1.43:5010');

		// Listen for 'initial_data' event
		socket.on('initial_data', (dataList) => {
			if (!inited) { // เวลามี client ใหม่ ไป connect server จะ emit ตัวนี้มาตลอดทุกครั้ง
				const dataWithAnimations = dataList.map((data) => ({
					...data,
					since: calculateSinceTime(data.fromDate),
					animatedValue: new Animated.Value(0),
				}));
				setTableData(dataWithAnimations);
				setInited(true);
			}
		});

		// Listen for 'update_status' and 'update_count' events
		socket.on('update_status', (updateData) => {
			handleUpdate(updateData, 'status');
		});
		socket.on('update_count', (updateData) => {
			handleUpdate(updateData, 'count');
		});

		// Clock update every second
		const clockInterval = setInterval(() => {
			const currentTime = new Date();
			setClock(
				`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime
					.getMinutes()
					.toString()
					.padStart(2, '0')}:${currentTime
						.getSeconds()
						.toString()
						.padStart(2, '0')}`
			);
		}, 1000);

		const intervalId = setInterval(() => {
			setTableData((prevData) =>
				prevData.map((data) => ({
					...data,
					since: calculateSinceTime(data.fromDate),
				}))
			);
		}, 60000); // Every minute

		return () => {
			clearInterval(intervalId);
			clearInterval(clockInterval);
			socket.disconnect();
		};
	}, []);

	const handleUpdate = (updateData, type) => {
		setTableData((prevData) =>
			prevData.map((data) => {
				if (data.machine === updateData.machine) {
					const hasChanged = data[type] !== updateData[type];
					const newData = { ...data, ...updateData }; //Merges the existing data with the new data, effectively updating the fields specified in updateData.

					if (type === 'status' && updateData.fromDate && hasChanged) {
						newData.since = calculateSinceTime(updateData.fromDate);
						newData.fromDate = updateData.fromDate;
					}

					if (hasChanged) { // Can be both status and count
						triggerAnimation(newData.animatedValue);
					}

					return newData;
				}
				return data;
			})
		);
	};

	const triggerAnimation = (animatedValue) => {
		Animated.sequence([
			Animated.timing(animatedValue, {
				toValue: 1,
				duration: 400,
				useNativeDriver: false,
			}),
			Animated.timing(animatedValue, {
				toValue: 0,
				duration: 400,
				useNativeDriver: false,
			}),
		]).start();
	};

	const calculateSinceTime = (fromDate) => {
		if (!fromDate) return 'N/A';
		const now = new Date();
		const pastDate = new Date(fromDate);
		const difference = Math.floor((now - pastDate) / (1000 * 60)); // in minutes
		return difference >= 0 ? `${difference} min` : 'N/A';
	};

	const statusDefinitions = {
		200: { text: 'Running', color: '#83CC21' },
		210: { text: 'Idle', color: '#F9F733' },
		220: { text: 'Setup', color: '#00C3FF' },
		230: { text: 'Wait Material', color: '#FFA500' },
		300: { text: 'Maintenance', color: '#A66DD0' },
		310: { text: 'Calibration', color: '#808080' },
		320: { text: 'Break', color: '#1E90FF' },
		330: { text: 'Shift Change', color: '#17AF91' },
		400: { text: 'Machine Down', color: '#ED6112' },
		410: { text: 'Power Failure', color: '#FF0000' },
		420: { text: 'Emergency Stop', color: '#FF6347' },
		430: { text: 'Quality Issue', color: '#8B0000' },
		440: { text: 'Oper Absence', color: '#FF410C' },
		500: { text: 'No Connection', color: '#A9A9A9' },
	};

	const widthArr = [
		20,  // 20 pixel fixed for Circle
		screenWidth * 0.15,  // % for Machine
		screenWidth * 0.08,  // % for Line
		screenWidth * 0.30,  // % for Status
		screenWidth * 0.20,  // % for Since
		screenWidth * 0.15   // % for Count
	];

	return (
		<View style={styles.container}>
			{/* Title and Clock in the same row */}
			<View style={styles.header}>
				<Text style={styles.title}>Machine Real-Time Status</Text>
				<Text style={styles.clock}>{clock}</Text>
			</View>

			<Table >
				<Row
					data={['', 'Machine', 'Line', 'Status', 'Since', 'Count']}
					style={styles.head}
					textStyle={styles.text}
					widthArr={widthArr}
				/>
			</Table >

			<ScrollView style={styles.scrollContainer}>
				<Table >
					{tableData.map((rowData, index) => {
						const rowBackgroundColor = rowData.animatedValue.interpolate({
							inputRange: [0, 1],
							outputRange: ['transparent', '#8f8f5e'],
						});

						return (
							<Animated.View
								key={index}
								style={{ backgroundColor: rowBackgroundColor }}
							>
								<Row
									data={[
										// Status circle
										<View
											style={[
												styles.statusCircle,
												{
													backgroundColor:
														statusDefinitions[rowData.status]?.color || '#A9A9A9',
												},
											]}
										/>,
										rowData.machine,
										rowData.line,
										// Status text with color
										<Text
											style={{
												color: statusDefinitions[rowData.status]?.color,
											}}
										>
											{statusDefinitions[rowData.status]?.text || 'Unknown'}
										</Text>,
										rowData.since,
										rowData.count || 'N/A',
									]}
									textStyle={styles.text}
									widthArr={widthArr}
								/>
								{/* Add a separator line after machine 6 and machine 13 */}
								{index === 5 || index === 12 ? (
									<View style={styles.separator} />
								) : null}
							</Animated.View>
						);
					})}
				</Table>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#1e1e1e', // Dark theme
		padding: 16,
		paddingTop: 10,
	},
	header: {
		flexDirection: 'row', // Align children in a row
		justifyContent: 'space-between', // Push title and clock to opposite sides
		alignItems: 'center', // Align items vertically in the center
		marginBottom: 5,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#ffffff',
		textAlign: 'center',
		// marginBottom: 10,
	},
	clock: {
		color: '#ffffff',
		fontSize: 16,
		position: 'absolute',
		// top: 10,
		right: 10,
	},
	head: {
		height: 40,
		backgroundColor: '#333333',
	},
	text: {
		color: '#ffffff',
		textAlign: 'center',
	},
	statusCircle: {
		width: 20,
		height: 20,
		borderRadius: 10,
		margin: 3,
	},
	separator: {
		height: 1,           // Thickness of the separator
		backgroundColor: '#ffffff',  // Color of the separator
		marginVertical: 10,   // Space above and below the line
	},
	scrollContainer: {
		marginBottom: 5, // Adjust this if you have a footer
	},
});

export default MachineScreen;