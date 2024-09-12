// To Run : npx expo start

import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import { Provider as PaperProvider, Card } from 'react-native-paper';

export default function ScannerScreen({ route }) {

	const [station, setStation] = useState('');
	const [orderId, setOrderId] = useState('');
	const [customer, setCustomer] = useState('');
	const [product, setProduct] = useState('');
	const [model, setModel] = useState('');
	const [incomingQty, setIncomingQty] = useState(0);
	const [outgoingQty, setOutgoingQty] = useState(0);

	const [stlist, setStlist] = useState([]);

	const [responseData, setResponseData] = useState(null);

	const navigation = useNavigation();
	// const isFocused = useIsFocused();

	// 1. ===================== Scanner Section ====================
	// ขาไปหน้า Camera
	const openScanner = () => {
		navigation.navigate('Camera');
	};

	// ขากลับมาจาก Camera screen เท่านั้น เพราะที่อื่นไม่มีการใส่ scannedData
	// และถ้า scan code เดิม หรือกด Back มาเฉยๆ จาก Camera screen ก็จะไม่รันเช่นกัน
	useEffect(() => {
		if (route.params?.scannedData) {

			setOrderId(route.params.scannedData);

			const fetchData = async () => {
				try {
					const message = {
						queryName: 'orderDetailsFromId',
						params: { "orderId": route.params.scannedData }
					}
					const result = await axios.post('http://192.168.1.43:5011/query', message);
					if (result && result.data) {
						console.log("Query result:", result.data);
						setCustomer(result.data[0][2]);
						setProduct(result.data[0][4]);
						setModel(result.data[0][5]);
					}
				} catch (error) {
					console.error(error);
					Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
				}
			};
			fetchData();
		}
	}, [route.params?.scannedData]);

	//2. =========================== SQL Secion ==============================
	// ตอนสร้างหน้าครั้งแรก, อย่าตกใจที่ดูยาวๆ เพราะมัน return async แถมยังเก็บตัว data จริงไว้ใน result.data อีก
	useEffect(() => {
		const fetchData = async () => {
			try {
				const message = { queryName: 'stationList', params: {} };
				const result = await axios.post('http://192.168.1.43:5011/query', message);
				if (result && result.data) {
					console.log("Query result:", result.data);
					const pickerItems = result.data.map(itemArray => ({
						label: itemArray[0], // Access the first element of each sub-array
						value: itemArray[0],
					}));
					setStlist(pickerItems);
				}
			} catch (error) {
				console.error(error);
				Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
			}
		};
		fetchData();
	}, []);

	// 3. ========================== GUI Section ===============================
	return (
		<PaperProvider>
			<ScrollView contentContainerStyle={styles.container}>
				<Card style={styles.card}>
					<Card.Content>
						<Text style={styles.label}>Station:</Text>
						<RNPickerSelect
							onValueChange={(value) => setStation(value)}
							items={stlist}
							style={pickerSelectStyles}
							placeholder={{ label: 'Select station', value: null }}
						/>

						<Button title="Scan Runcard" onPress={openScanner} />

						<Text style={styles.label}>Order ID:</Text>
						<Text style={styles.displayText}>{orderId}</Text>

						<Text style={styles.label}>Customer:</Text>
						<Text style={styles.displayText}>{customer}</Text>

						<Text style={styles.label}>Product:</Text>
						<Text style={styles.displayText}>{product}</Text>

						<Text style={styles.label}>Model:</Text>
						<Text style={styles.displayText}>{model}</Text>
					</Card.Content>
				</Card>
			</ScrollView>
		</PaperProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		padding: 16,
	},
	card: {
		backgroundColor: '#222',
		borderRadius: 4,
		padding: 2,
	},
	label: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 8,
	},
	displayText: {
		color: '#ebda7c', // Somewhat yellow
		fontSize: 24,
		marginBottom: 16,
	},
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		color: '#ccc',
		paddingRight: 30,
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		color: '#ebda7c', // Somewhat yellow
		paddingRight: 30,
	},
});
