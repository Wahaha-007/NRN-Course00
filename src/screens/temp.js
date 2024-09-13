// 1.2 Data of Lot
const message2 = {
	queryName: 'orderDetailsFromId',
	params: { "orderId": route.params.scannedData }
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
	params: { "orderId": route.params.scannedData, "nextStation": station }
}
const result3 = await axios.post('http://192.168.1.43:5011/query', message3);
if (result3 && result3.data) {
	console.log("Query result:", result3.data);
	if (result3.data == []) setIncomingQty(0);
	else setIncomingQty(result3.data[0][0]); // ระวังเรื่อง row = 0 ด้วย
}

// 1.4 Data of Output	
const message4 = {
	queryName: 'stationQty',
	params: { "orderId": route.params.scannedData, "station": station, "type": "input" }
}
const result4 = await axios.post('http://192.168.1.43:5011/query', message4);
if (result4 && result4.data) {
	console.log("Query result:", result4.data);
	if (result4.data == []) setOutgoingQty(0);
	else setOutgoingQty(result4.data[0][0]); // ระวังเรื่อง row = 0 ด้วย
}