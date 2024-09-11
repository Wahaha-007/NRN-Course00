import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { Table, Row, Rows } from 'react-native-table-component';

// MachineScreen component
const MachineScreen = () => {
	const [machineData, setMachineData] = useState([]);
	const [sinceTimes, setSinceTimes] = useState([]);

	// Calculate the "since" column based on the fromDate
	const calculateSinceTime = (fromDate) => {
		const currentTime = new Date();
		const previousTime = new Date(fromDate);
		const timeDiff = Math.floor((currentTime - previousTime) / 1000 / 60); // Time diff in minutes
		return timeDiff;
	};

	// Update the "since" times every minute
	useEffect(() => {
		const intervalId = setInterval(() => {
			setSinceTimes((prevTimes) =>
				prevTimes.map(({ fromDate }) => calculateSinceTime(fromDate))
			);
		}, 60000); // Every minute

		return () => clearInterval(intervalId);
	}, []);

	// Handle incoming socket data
	useEffect(() => {
		// Connect to the Socket.IO server
		const socket = io('http://192.168.1.43:5010');

		// Listen for 'initial_data' event
		socket.on('initial_data', (dataList) => {

			setMachineData(dataList);
			setSinceTimes(
				dataList.map((data) => ({
					machine: data.machine,
					fromDate: data.fromDate,
					since: calculateSinceTime(data.fromDate),
				}))
			);
		});

		// Listen for 'update_status' event
		socket.on('update_status', (updatedData) => {
			setMachineData((prevData) =>
				prevData.map((machine) =>
					machine.machine === updatedData.machine
						? { ...machine, ...updatedData }
						: machine
				)
			);
		});

		// Listen for 'update_count' event
		socket.on('update_count', (updatedData) => {
			setMachineData((prevData) =>
				prevData.map((machine) =>
					machine.machine === updatedData.machine
						? { ...machine, count: updatedData.count }
						: machine
				)
			);
		});

		// Clean up the socket connection
		return () => socket.disconnect();
	}, []);

	// Prepare table data
	const tableData = machineData.map((machine) => {
		const sinceTime = sinceTimes.find((since) => since.machine === machine.machine)?.since || 'N/A';
		return [
			machine.machine,
			machine.line,
			machine.status,
			sinceTime,
			machine.count || 'N/A', // Count may not be available in some updates
		];
	});

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Machine Real-Time Status</Text>
			<Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
				<Row
					data={['Machine', 'Line', 'Status', 'For', 'Count']}
					style={styles.head}
					textStyle={styles.text} // Provide an empty object here
				/>
				<Rows data={tableData} textStyle={styles.text} />
			</Table>
		</View>
	);
};

// Styles for the screen
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingTop: 30,
		backgroundColor: '#000',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
		color: 'white',
	},
	head: {
		height: 40,
		backgroundColor: '#2e2e2e',
	},
	text: {
		marginTop: 2,
		marginBottom: 2,
		textAlign: 'center',
		color: 'white',
	},
	tableBorder: {
		borderColor: '#555555', // Subtle contrast for borders
		borderWidth: 1,
	},
	tableRow: {
		height: 40,
		backgroundColor: '#2a2a2a', // Darker row background
	},
});

export default MachineScreen;
