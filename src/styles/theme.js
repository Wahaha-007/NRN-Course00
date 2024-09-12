import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000', // Black background
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff', // White text for contrast
		fontSize: 20,
	},
	title: {
		fontSize: 18,
		marginBottom: 16,
	},
	tabBarStyle: {
		backgroundColor: '#000', // Black theme for tab bar
		borderTopWidth: 0,
	},
	responseBox: {
		marginTop: 20,
		padding: 10,
		backgroundColor: '#f5f5f5',
		borderRadius: 6,
		width: 200,
		color: '#000',
	},
	selectedValue: {
		fontSize: 16,
		marginTop: 16,
	},
});

