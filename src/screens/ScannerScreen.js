// To Run : npx expo start
// gunicorn -w 1 -b 0.0.0.0:5011 nameQuery:app

import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';

import { Button, View, Text, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import { Provider as PaperProvider, Card } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';

import axios from 'axios'; // Background Task

export default function ScannerScreen({ route }) {

	const { navigationParams, setNavigationParams } = useNavigationContext();
	const { scannedData, source } = navigationParams;

	const [station, setStation] = useState('A-01');
	const [orderId, setOrderId] = useState('');
	const [validOrder, setValidOrder] = useState(false);
	const [customer, setCustomer] = useState('');
	const [product, setProduct] = useState('');
	const [model, setModel] = useState('');
	const [incomingQty, setIncomingQty] = useState(0);
	const [outgoingQty, setOutgoingQty] = useState(0);

	const [stlist, setStlist] = useState([]);

	const [responseData, setResponseData] = useState(null);

	const navigation = useNavigation();
	const isFocused = useIsFocused();

	const isBox1Enabled = true; // Set to true/false to enable or disable box 1
	const isBox2Enabled = false; // Set to true/false to enable or disable box 2

	const maxBox1Value = 300; // Max value for box 1
	const maxBox2Value = 300; // Max value for box 2

	//1. ========================== Machine Station Menu ==============================
	// ตอนสร้างหน้าครั้งแรก, อย่าตกใจที่ดูยาวๆ เพราะมัน return async แถมยังเก็บตัว data จริงไว้ใน result.data อีก
	useEffect(() => {
		// const fetchData = async () => {
		// 	try {
		// 		const message = { queryName: 'stationList', params: {} };
		// 		const result = await axios.post('http://192.168.1.43:5011/query', message);
		// 		if (result && result.data) {
		// 			console.log("Query result:", result.data);
		// 			const pickerItems = result.data.map(itemArray => ({
		// 				label: itemArray[0], // Access the first element of each sub-array
		// 				value: itemArray[0],
		// 			}));
		// 			setStlist(pickerItems);
		// 			console.log("pickerItems", pickerItems);
		// 		}
		// 	} catch (error) {
		// 		console.error(error);
		// 		Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
		// 	}
		// };
		// fetchData();

		// อันนี้คือผลจากข้างบน ทำแบบนี้ลด Dynamic แต่ประหยัดค่าติดต่อ SQL Server ไปได้
		setStlist([{ "label": "A-01", "value": "A-01" }, { "label": "A-02", "value": "A-02" }, { "label": "B-01", "value": "B-01" }, { "label": "B-02", "value": "B-02" }, { "label": "C-02", "value": "C-02" }, { "label": "C-01", "value": "C-01" }, { "label": "D-01", "value": "D-01" }, { "label": "D-02", "value": "D-02" }, { "label": "ST-02", "value": "ST-02" }, { "label": "ST-01", "value": "ST-01" }]);
	}, []);

	// 2. ===================== Scanner Section ====================
	// ขาไปหน้า Camera
	const openScanner = () => {
		navigation.navigate('Camera');
	};

	// ขากลับมาจาก Camera screen เท่านั้น เพราะที่อื่นไม่มีการใส่ scannedData
	// และถ้า scan code เดิม หรือกด Back มาเฉยๆ จาก Camera screen ก็จะไม่รันเช่นกัน
	// จุดนี้ถือเป็นจุดเริ่มต้นการทำงานจริงของหน้านี้ด้วย

	useEffect(() => {

		if (isFocused && source == 'Camera') {

			if (scannedData) {

				setOrderId(scannedData); // อย่าเอาพวก State มาใช้ใน immediate logic นะ

				const fetchData = async (newScannedLot) => {
					console.log("New lot into function:", newScannedLot);
					try {
						// 1.1 Lot eligibility at this machine
						const message1 = {
							queryName: 'waitingIncoming_1',
							params: { "nextStation": station }
						}
						const result1 = await axios.post('http://192.168.1.43:5011/query', message1);
						if (result1 && result1.data) { // ถ้าส่งอะไรกลับมาแสดงว่า Server connection ไม่มีปัญหา
							const flattenedLot = result1.data.flat();
							console.log("flattenLot:", flattenedLot);
							console.log("vs order", newScannedLot);

							if (flattenedLot.includes(newScannedLot)) { // ดูจากข้อมูล machine เครื่องนี้ กำลังรอ Lot นี้พอดี
								setValidOrder(true);

								// 1.2 Data of Lot
								const message2 = {
									queryName: 'orderDetailsFromId',
									params: { "orderId": newScannedLot }
								}
								const result2 = await axios.post('http://192.168.1.43:5011/query', message2);
								if (result2 && result2.data) {
									console.log("Query result:", result2.data);
									setCustomer(result2.data[0][2]);
									setProduct(result2.data[0][4]);
									setModel(result2.data[0][5]);
								}

								// 1.3 Data of Input
								const message3 = {
									queryName: 'orderInputQty',
									params: { "orderId": newScannedLot, "nextStation": station }
								}
								const result3 = await axios.post('http://192.168.1.43:5011/query', message3);
								if (result3 && result3.data) {
									console.log("Query result:", result3.data);
									if (result3.data.length == 0) setIncomingQty(0);
									else setIncomingQty(result3.data[0][0]); // ระวังเรื่อง row = 0 ด้วย
								}

								// 1.4 Data of Output	
								const message4 = {
									queryName: 'stationQty',
									params: { "orderId": newScannedLot, "station": station, "type": "input" }
								}
								const result4 = await axios.post('http://192.168.1.43:5011/query', message4);
								if (result4 && result4.data) {
									console.log("Query result:", result4.data);
									if (result4.data.length == 0) setOutgoingQty(0);
									else setOutgoingQty(result4.data[0][0]); // ระวังเรื่อง row = 0 ด้วย
								}

							} else {// ดูจากข้อมูล machine นี้ ไม่ต้องการ lot นี้

								setOrderId('- Invalid Lot -');
								setModel('-');
								setProduct('-');
								setCustomer('-');
								setIncomingQty(0);
								setOutgoingQty(0);
							}
						}
					} catch (error) {
						console.error(error);
						Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
					}
				};

				fetchData(scannedData);

			}
			setNavigationParams({ scannedData: '', source: '' });
		}

		if (isFocused && source == 'Camera') {
			console.log(scannedData);
		}
	}, [isFocused]); //, 

	// 3. ========================= In/Out button ===============================

	const handleIncomingChange = (value) => {
		const numericValue = parseInt(value, 10);
		if (numericValue <= maxBox1Value) {
			setIncomingQty(numericValue);
		} else {
			setIncomingQty(maxBox1Value); // If input exceeds max, set it to max value
		}
	};

	const handleOutgoingChange = (value) => {
		const numericValue = parseInt(value, 10);
		if (numericValue <= maxBox2Value) {
			setOutgoingQty(numericValue);
		} else {
			setOutgoingQty(maxBox2Value);
		}
	};

	const inButton = () => {

	};

	const outButton = () => {

	};























	// 4. ========================== GUI Section ===============================
	return (

		<PaperProvider>
			<KeyboardAwareScrollView
				contentContainerStyle={styles.container}
				enableOnAndroid={true} // This ensures it works on Android as well
				extraHeight={450} // Adjust this height if necessary
				keyboardOpeningTime={0} // Helps with Android
			>
				<Card style={styles.card}>
					<Card.Content>
						<Text style={styles.label}>Station:</Text>
						<RNPickerSelect
							onValueChange={(value) => setStation(value)}
							items={stlist}
							value={station}
							style={pickerSelectStyles}
							placeholder={{ label: 'Select station', value: null }}
						/>

						<View style={styles.buttonContainerup}>
							<Button title="Scan Runcard" onPress={openScanner} color="#666" />
						</View>

						<Text style={styles.label}>Order ID:</Text>
						<Text style={styles.displayText}>{orderId}</Text>

						<Text style={styles.label}>Customer:</Text>
						<Text style={styles.displayText}>{customer}</Text>

						<Text style={styles.label}>Product:</Text>
						<Text style={styles.displayText}>{product}</Text>

						<Text style={styles.label}>Model:</Text>
						<Text style={styles.displayText}>{model}</Text>

						{/* Upper Row with Two Boxes */}
						<View style={styles.row}>
							<TextInput
								style={styles.input}
								value={incomingQty.toString()} // Convert numeric value to string for TextInput
								onChangeText={setIncomingQty} // Function to handle value change
								editable={isBox1Enabled} // Enable/disable based on variable
								keyboardType="numeric" // Numeric keyboard
								maxLength={maxBox1Value.toString().length} // Maximum length based on the max value
								onEndEditing={(e) => handleIncomingChange(e.nativeEvent.text)} // To handle max value enforcement
							/>
							<TextInput
								style={styles.input}
								value={outgoingQty.toString()}
								onChangeText={setOutgoingQty}
								editable={isBox2Enabled}
								keyboardType="numeric"
								maxLength={maxBox2Value.toString().length}
								onEndEditing={(e) => handleOutgoingChange(e.nativeEvent.text)}
							/>
						</View>

						{/* Lower Row with Two Buttons */}
						<View style={styles.row}>
							<View style={styles.buttonContainer}>
								<Button title="In" onPress={inButton} color="#666" />
							</View>
							<View style={styles.buttonContainer}>
								<Button title="Out" onPress={outButton} color="#666" />
							</View>
						</View>
					</Card.Content>
				</Card>
			</KeyboardAwareScrollView>
		</PaperProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		padding: 8
	},
	card: {
		backgroundColor: '#222',
		borderRadius: 8,
		padding: 0,
		marginBottom: 5,
	},
	label: {
		color: '#fff',
		fontSize: 16,
		marginVertical: 8,
	},
	displayText: {
		color: '#ebda7c', // Somewhat yellow
		fontSize: 24,
		marginBottom: 10,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10, // Space between rows
	},
	box: {
		flex: 2,
		height: 50,
		borderWidth: 1,
		borderColor: '#ddd',
		marginHorizontal: 8,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		backgroundColor: '#f5f5f5',
	},
	boxText: {
		fontSize: 32,
		fontWeight: 'bold',
	},
	buttonContainerup: {
		marginTop: 10,
		height: 40,
	},
	buttonContainer: {
		flex: 1,
		marginHorizontal: 8,
	},
	input: {
		flex: 1,
		height: 60, // Adjust height as needed
		borderWidth: 1,
		borderColor: '#ddd',
		margin: 10,
		borderRadius: 10,
		paddingHorizontal: 10,
		fontSize: 20,
		textAlign: 'center', // Center the numeric input text
		color: '#fff',
	},
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		textAlign: 'center',
		fontSize: 24,
		paddingHorizontal: 12,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		color: '#fff',
		backgroundColor: '#222',
		paddingRight: 30,
	},
	inputAndroid: {
		textAlign: 'center',
		fontSize: 24,
		paddingHorizontal: 12,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		color: '#fff',
		backgroundColor: '#444',
		paddingRight: 30,
	},
	placeholder: {
		fontSize: 24, // Font size for placeholder
		color: 'gray', // Placeholder text color
		textAlign: 'center',
	},
});
