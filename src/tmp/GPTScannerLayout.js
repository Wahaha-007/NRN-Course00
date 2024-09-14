import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ScannerScreen = () => {
	const [station, setStation] = useState('Select...');
	const [orderID, setOrderID] = useState('null');
	const [customer, setCustomer] = useState('null');
	const [product, setProduct] = useState('null');
	const [model, setModel] = useState('null');
	const [inQty, setInQty] = useState('');
	const [outQty, setOutQty] = useState('');

	return (
		<View style={styles.container}>
			{/* Station dropdown */}
			<Text style={styles.label}>Station :</Text>
			<View style={styles.dropdownContainer}>
				<Picker
					selectedValue={station}
					onValueChange={(itemValue) => setStation(itemValue)}
					style={styles.dropdown}
					dropdownIconColor="#FFFFFF"
					mode="dropdown"
				>
					<Picker.Item label="Select..." value="Select..." />
					<Picker.Item label="Station 1" value="Station 1" />
					<Picker.Item label="Station 2" value="Station 2" />
					<Picker.Item label="Station 3" value="Station 3" />
				</Picker>
			</View>

			{/* Scan Runcard button */}
			<TouchableOpacity style={styles.scanButton}>
				<Text style={styles.scanButtonText}>Scan Runcard</Text>
			</TouchableOpacity>

			{/* Display fields for orderID, customer, product, model */}
			<View style={styles.displayContainer}>
				<Text style={styles.displayText}>Order ID :</Text>
				<TextInput style={styles.displayBox} value={orderID} editable={false} />

				<Text style={styles.displayText}>Customer :</Text>
				<TextInput style={styles.displayBox} value={customer} editable={false} />

				<Text style={styles.displayText}>Product :</Text>
				<TextInput style={styles.displayBox} value={product} editable={false} />

				<Text style={styles.displayText}>Model :</Text>
				<TextInput style={styles.displayBox} value={model} editable={false} />
			</View>

			{/* In and Out numerical input */}
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.numInput}
					keyboardType="numeric"
					placeholder="In Qty"
					value={inQty}
					onChangeText={setInQty}
				/>
				<TextInput
					style={styles.numInput}
					keyboardType="numeric"
					placeholder="Out Qty"
					value={outQty}
					onChangeText={setOutQty}
				/>
			</View>

			{/* In and Out buttons */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.inButton}>
					<Text style={styles.buttonText}>In</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.outButton}>
					<Text style={styles.buttonText}>Out</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
		padding: 20,
	},
	label: {
		color: '#FFFFFF',
		fontSize: 18,
		marginBottom: 5,
	},
	dropdownContainer: {
		borderColor: '#FFFFFF',
		borderWidth: 1,
		borderRadius: 5,
		marginBottom: 15,
	},
	dropdown: {
		color: '#FFFFFF',
		backgroundColor: '#1E1E1E',
	},
	scanButton: {
		backgroundColor: '#2196F3',
		paddingVertical: 15,
		borderRadius: 5,
		marginBottom: 20,
	},
	scanButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		textAlign: 'center',
	},
	displayContainer: {
		marginBottom: 20,
	},
	displayText: {
		color: '#FFFFFF',
		fontSize: 16,
		marginBottom: 5,
	},
	displayBox: {
		borderWidth: 1,
		borderColor: '#FFFFFF',
		backgroundColor: '#1E1E1E',
		color: '#FFFFFF',
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginBottom: 10,
		borderRadius: 5,
	},
	inputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	numInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#FFFFFF',
		backgroundColor: '#1E1E1E',
		color: '#FFFFFF',
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 5,
		marginRight: 10,
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	inButton: {
		flex: 1,
		backgroundColor: '#2196F3',
		paddingVertical: 15,
		borderRadius: 5,
		marginRight: 10,
	},
	outButton: {
		flex: 1,
		backgroundColor: '#2196F3',
		paddingVertical: 15,
		borderRadius: 5,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 18,
		textAlign: 'center',
	},
});

export default ScannerScreen;
