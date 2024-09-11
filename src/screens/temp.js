import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Dimensions,
} from 'react-native';
import io from 'socket.io-client';
import { Table, Row } from 'react-native-table-component';

const screenWidth = Dimensions.get('window').width;

const MachineScreen = () => {
	const [tableData, setTableData] = useState([]);
	const [clock, setClock] = useState('');

	const widthArr = [
		screenWidth * 0.1,  // Status Circle
		screenWidth * 0.15, // Machine
		screenWidth * 0.15, // Line
		screenWidth * 0.25, // Status
		screenWidth * 0.15, // Since
		screenWidth * 0.2,  // Count
	];

	useEffect(() => {
		const socket = io('http://192.168.1.43:5010');

		// Handle 'initial_data'
		socket.on('initial_data', (dataList) => {
			const dataWithAnimations = dataList.map((data) => ({
				...data,
				since: calculateSinceTime(data.fromDate),
				animatedValue: new Animated.Value(0),
			}));
			setTableData(dataWithAnimations);
		});

		// Handle updates
		socket.on('update_status', (updateData) => {
			handleUpdate(updateData, 'status');
		});

		socket.on('update_count', (updateData) => {
			handleUpdate(updateData, 'count');
		});

		// Update clock every second
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

		// Update 'since' times every minute
		const sinceInterval = setInterval(() => {
			setTableData((prevData) =>
				prevData.map((data) => ({
					...data,
					since: calculateSinceTime(data.fromDate),
				}))
			);
		}, 60000);

		return () => {
			clearInterval(clockInterval);
			clearInterval(sinceInterval);
			socket.disconnect();
		};
	}, []);

	const handleUpdate = (updateData, type) => {
		setTableData((prevData) =>
			prevData.map((data) => {
				if (data.machine === updateData.machine) {
					const hasChanged = data[type] !== updateData[type];
					const newData = { ...data, ...updateData };

					if (type === 'status' && updateData.fromDate) {
						newData.since = calculateSinceTime(updateData.fromDate);
						newData.fromDate = updateData.fromDate;
					}

					if (hasChanged) {
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
				duration: 200,
				useNativeDriver: false,
			}),
			Animated.timing(animatedValue, {
				toValue: 0,
				duration: 200,
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

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Machine Real-Time Status</Text>
			<Text style={styles.clock}>{clock}</Text>
			<Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
				<Row
					data={['', 'Machine', 'Line', 'Status', 'Since', 'Count']}
					style={styles.head}
					textStyle={styles.text}
					widthArr={widthArr}
				/>
				{tableData.map((rowData, index) => {
					const rowBackgroundColor = rowData.animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: ['transparent', '#FFFF99'],
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
						</Animated.View>
					);
				})}
			</Table>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#1e1e1e', // Dark theme
		padding: 16,
		paddingTop: 30,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#ffffff',
		textAlign: 'center',
		marginBottom: 10,
	},
	clock: {
		color: '#ffffff',
		fontSize: 18,
		position: 'absolute',
		top: 10,
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
		margin: 6,
	},
});

export default MachineScreen;
