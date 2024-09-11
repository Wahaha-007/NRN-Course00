import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import io from 'socket.io-client';
import { Table, Row, Rows } from 'react-native-table-component';

const screenWidth = Dimensions.get('window').width;

const MachineScreen = () => {
	const [tableData, setTableData] = useState([]);
	const [sinceTimes, setSinceTimes] = useState([]);
	const [clock, setClock] = useState('');
	const [animatedValue] = useState(new Animated.Value(0));
	const [inited, setInited] = useState(false);

	useEffect(() => {
		// Initialize WebSocket connection
		const socket = io('ws://192.168.1.43:5010');

		// Listen for 'initial_data' event
		socket.on('initial_data', (dataList) => {
			if (!inited) { // เวลามี client ใหม่ ไป connect server จะ emit ตัวนี้มาตลอดทุกครั้ง
				setTableData(dataList);
				setSinceTimes(
					dataList.map((data) => ({
						machine: data.machine,
						fromDate: data.fromDate,
						since: calculateSinceTime(data.fromDate),
					}))
				);
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
		// Recalculate since times and update the table
		const updatedData = tableData.map((data) => {
			if (data.machine === updateData.machine) {
				const newData = { ...data, ...updateData };
				if (type === 'status') {
					newData.since = calculateSinceTime(newData.fromDate);
				}
				triggerAnimation();
				return newData;
			}
			return data;
		});
		setTableData(updatedData);
	};

	const triggerAnimation = () => {
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
		screenWidth * 0.12   // % for Count
	];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Machine Real-Time Status</Text>
			<Text style={styles.clock}>{clock}</Text>
			<Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
				<Row
					data={['', 'Machine', 'Line', 'Status', 'For', 'Count']}
					style={styles.head}
					textStyle={styles.text}
					widthArr={widthArr} // Apply the width array here
				/>
				<Rows
					data={tableData.map((row, index) => [
						<View style={[styles.statusCircle, { backgroundColor: statusDefinitions[row.status]?.color || '#A9A9A9' }]} />,
						row.machine,
						row.line,
						<Text style={{ color: statusDefinitions[row.status]?.color, padding: 2 }}>
							{statusDefinitions[row.status]?.text || 'Unknown'}
						</Text>,
						row.since,
						row.count,
					])}
					textStyle={styles.text}
					widthArr={widthArr} // Apply the width array here
				/>
			</Table>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#1e1e1e',
		padding: 16,
		justifyContent: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#ffffff',
		textAlign: 'center',
		marginBottom: 20,
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
		// borderRadius: 5,
	},
});


export default MachineScreen;