import React, { useState, useEffect, useContext } from 'react'; // System
import { useNavigationContext } from '../context/NavigationContext';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'; // Background Task

export default function BreakageInputScreen() {

	const [pageStation, setPageStation] = useState('');
	const [pageOrderId, setPageOrderId] = useState('');
	const isFocused = useIsFocused();
	const { navigationParams, setNavigationParams } = useNavigationContext();
	const { station, orderId, customer, product, model } = navigationParams;

	// Screen Element Vars (Logic <-> GUI)
	const [subs, setSubs] = useState(['-', '-', '-', '-']);
	const [qty, setQty] = useState([0, 0, 0, 0]);
	const [byHuman, setByHuman] = useState([false, false, false, false]);
	const [byMachine, setByMachine] = useState([false, false, false, false]);
	const [byProcess, setByProcess] = useState([false, false, false, false]);
	const [stationOrderBr, setStationOrderBr] = useState(0);
	const [isInputEnabled, setIsInputEnabled] = useState(false);

	useEffect(() => {

		if (isFocused) {

			if (orderId != '' && orderId != undefined) {
				setIsInputEnabled(true);

				// ส่วนบนของจอ, ใช้รับ Input ต่างๆ จาก User
				if (station != pageStation && station != undefined) {

					setQty([0, 0, 0, 0]);
					setByHuman([false, false, false, false]);
					setByMachine([false, false, false, false]);
					setByProcess([false, false, false, false]);

					const fetchDataUp = async () => {
						try {
							// --- ส่วนบน พิมพ์ชื่อ Substation
							const message1 = {
								queryName: 'substationFromStation',
								params: { "stCode": station }
							}
							const result1 = await axios.post('http://192.168.1.43:5011/query', message1);
							if (result1 && result1.data) {
								setSubs(result1.data.map((sub) => sub[1])); // ใน 1 row มี 2 columns
							}
						} catch (error) {
							console.error(error);
							Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
						}
					};
					fetchDataUp();
				}

				if (orderId != pageOrderId || station != pageStation) {

					const fetchDataDown = async () => {
						try {

							// --- ส่วนล่างสุดที่ระบุ Station นี้ Order นี้มี Breakage เท่าไหร่
							const message1 = {
								queryName: 'stationOrderBreakage',
								params: { "orderId": orderId, "station": station }
							}
							const result1 = await axios.post('http://192.168.1.43:5011/query', message1);
							if (result1 && result1.data) {
								if (result1.data.length == 0) setStationOrderBr(0);
								else setStationOrderBr(result1.data[0][0]);
							}
						} catch (error) {
							console.error(error);
							Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
						}
					};
					fetchDataDown();
				}

				setPageStation(station);
				setPageOrderId(orderId);
			}
			else { // Disable การบันทึก Breakage 
				setIsInputEnabled(false);
				setStationOrderBr(0);
				setSubs(['-', '-', '-', '-']);
			}
			setNavigationParams(prev => ({ ...prev, latestPage: 'BreakageInput' }));
		}
	}, [isFocused]);

	// Function to update breakage reason and toggle icons
	const toggleReason = (type, index) => {
		switch (type) {
			case 'human':
				const updatedByHuman = [...byHuman];
				updatedByHuman[index] = !byHuman[index];
				setByHuman(updatedByHuman);
				break;
			case 'machine':
				const updatedByMachine = [...byMachine];
				updatedByMachine[index] = !byMachine[index];
				setByMachine(updatedByMachine);
				break;
			case 'process':
				const updatedByProcess = [...byProcess];
				updatedByProcess[index] = !byProcess[index];
				setByProcess(updatedByProcess);
				break;
		}
	};

	// Handle breakage input change
	const handleInputChange = (text, index) => {
		const updatedQty = [...qty];
		updatedQty[index] = text ? parseInt(text, 10) : 0;
		setQty(updatedQty);
	};

	// 3. ปุ่มที่ใช้ส่ง Final data ให้ Database, ตอนนี้ทำแบบแยกคำสั่งไปก่อน เดี๋ยวไป optimize Store procedure ทีหลัง
	const handleSubmit = () => {

		const dataToSend = {
			station,
			subs,
			qty,
			reasons: { byHuman, byMachine, byProcess },
		};
		console.log('Sending data to database:', dataToSend);
		// Send data to your database

		const fetchData = async () => {
			try {

				let prevStation = '';
				let inQty = 0;
				let inCumQty = 0;

				// ----- 3.1 หาชื่อ Station ก่อน, ใช้บันทึกแถมไปด้วยเผื่อวิเคราะห์ทีหลัง
				const message1 = {
					queryName: 'previousStation',
					params: {
						"nextStation": station,
						"productModel": model,
						"productName": product
					}
				}
				const result1 = await axios.post('http://192.168.1.43:5011/query', message1);

				if (result1 && result1.data)  // ถ้าส่งอะไรกลับมาแสดงว่า Server connection ไม่มีปัญหา

					prevStation = result1.data[0][0];

				// -------- 3.2 บันทึกจริงล่ะทีนี้ แยกเป็น Loop เอาง่ายๆ ก่อน
				for (let i = 0; i < 4; i++) {
					if (qty[i] != 0) { // ถ้าเป็น 0 จะ save ไปทำไมกัน
						let message2 = {
							queryName: 'writeAddBreakage',
							params: {
								"orderId": orderId,
								"station": station,
								"subStation": i,
								"prevStation": prevStation,
								"operator": "Jimmy",
								"qty": qty[i],
								"byHuman": byHuman[i],
								"byMachine": byMachine[i],
								"byProcess": byProcess[i],
								"byOther": !(byHuman[i] || byMachine[i] || byProcess[i]),
							}
						}
						let result2 = await axios.post('http://192.168.1.43:5011/query', message2);
					}
				}

				// -------- 3.3 ใช้วิธีการ Confrm ที่เขียนไปตะกี้ด้วยการ Read ค่ารวมมาแสดง
				// ---------- กล่องล่างสุดที่ระบุ Station นี้ Order นี้มี Breakage เท่าไหร่
				const message3 = {
					queryName: 'stationOrderBreakage',
					params: { "orderId": orderId, "station": station }
				}
				const result3 = await axios.post('http://192.168.1.43:5011/query', message3);
				if (result3 && result3.data) {
					if (result3.data.length == 0) setStationOrderBr(0);
					else setStationOrderBr(result3.data[0][0]);
				}

				// -------- 3.4 ทีนี้เตรียมเปลี่ยนค่า Table เฉพาะของ Station บ้างล่ะ

				const message4 = {
					queryName: 'stationQty',
					params: {
						"orderId": orderId,
						"station": station,
						"type": "input"
					}
				}
				const result4 = await axios.post('http://192.168.1.43:5011/query', message4);

				if (result4.data.length == 0) {
					inQty = 0;
					inCumQty = 0;
				}
				else {
					inQty = result4.data[0][0];
					inCumQty = result4.data[0][1];
				}

				let lotBreakageInput = qty[0] + qty[1] + qty[2] + qty[3];
				let totalInput = inQty - lotBreakageInput;
				let totalCumInput = inCumQty;

				// 3.4 --------------- เขียนค่า Qty ใหม่ลงไป
				const message5 = {
					queryName: 'writeUpdateQty',
					params: {
						"orderId": orderId,
						"station": station,
						"nextStation": '',
						"qty": totalInput,
						"cum_qty": totalCumInput,
						"type": "input"
					}
				}
				const result5 = await axios.post('http://192.168.1.43:5011/query', message5);

				// 3.5 ----------- Reset Input เผื่อ user จะใส่อะไรเพิ่มอีก

				setQty([0, 0, 0, 0]);
				setByHuman([false, false, false, false]);
				setByMachine([false, false, false, false]);
				setByProcess([false, false, false, false]);

			} catch (error) {
				console.error(error);
				Alert.alert('Error', 'Something went wrong. Please check your input or try again later.');
			}
		};
		fetchData();

		setNavigationParams(prev => ({ ...prev, TaskNeedUpdate: true, ScanNeedUpdate: true }));
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.stationText}>{`Station: ${station}`}</Text>
				{subs.map((sub, index) => (
					<View key={index} style={styles.subRow}>
						<Text style={styles.subText}>{`${sub}`}</Text>
						<TextInput
							style={styles.input}
							keyboardType="numeric"
							editable={isInputEnabled}
							value={qty[index] === 0 ? '' : String(qty[index])}  // Show empty string if qty[index] is 0
							onChangeText={(text) => handleInputChange(text, index)}
						/>
						<View style={styles.iconRow}>
							<TouchableOpacity disabled={!isInputEnabled} onPress={() => toggleReason('human', index)}>
								<Icon
									name="user"
									size={24}
									color={byHuman[index] ? 'orange' : 'gray'}
								/>
							</TouchableOpacity>
							<TouchableOpacity disabled={!isInputEnabled} onPress={() => toggleReason('machine', index)}>
								<Icon
									name="wrench"
									size={24}
									color={byMachine[index] ? 'orange' : 'gray'}
								/>
							</TouchableOpacity>
							<TouchableOpacity disabled={!isInputEnabled} onPress={() => toggleReason('process', index)}>
								<Icon
									name="hand-paper-o"
									size={24}
									color={byProcess[index] ? 'orange' : 'gray'}
								/>
							</TouchableOpacity>
						</View>
					</View>
				))}
				<TouchableOpacity
					style={[styles.button, isInputEnabled ? styles.enabledButton : styles.disabledButton]}
					onPress={handleSubmit}
					disabled={!isInputEnabled} // Disable the button when isInputEnabled is false
				>
					<Text style={styles.buttonText}>Add Breakage</Text>
				</TouchableOpacity>

				<View style={styles.breakageDetails}>
					<Text style={styles.orderText}>Order : {orderId}</Text>
					<Text style={styles.orderText}>Total Breakage</Text>
					<Text style={[styles.breakageText, isInputEnabled ? styles.enabledText : styles.disabledText]}>{stationOrderBr}</Text>
				</View>
			</View>
		</View>
	);
};

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
		padding: 20,
		marginBottom: 5,
	},
	stationText: {
		fontSize: 22,
		color: '#fff',
		marginBottom: 30,
	},
	subRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 15,
	},
	subText: {
		flex: 2,
		fontSize: 18,
		color: '#fff',
	},
	input: {
		textAlign: 'center',
		flex: 1,
		height: 40,
		backgroundColor: '#fff',
		borderRadius: 5,
		paddingHorizontal: 10,
		fontSize: 20,
		marginRight: 15,
	},
	iconRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: 100,
	},
	button: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#00A0E9',
		borderRadius: 5,
		alignItems: 'center',
	},
	enabledButton: {
		backgroundColor: '#00A0E9',   // Button background when enabled
	},
	disabledButton: {
		backgroundColor: 'gray',   // Button background when disabled
	},
	buttonText: {
		color: '#fff',
		fontSize: 20,
		padding: 10,
	},
	breakageDetails: {
		marginTop: 20,
		alignItems: 'center',
	},
	orderText: {
		color: '#fff',
		fontSize: 16,
	},
	breakageText: {
		color: '#FFA500',
		fontSize: 24,
		marginTop: 10,
		padding: 20,
		borderWidth: 1,           // Border thickness
		borderColor: 'white',      // White border
	},
	enabledText: {
		color: '#FFA500',
	},
	disabledText: {
		color: 'gray',
	},
});