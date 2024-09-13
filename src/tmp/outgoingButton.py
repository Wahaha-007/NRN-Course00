
	#1. Prepare necessary variable
	order 	 = self.session.custom.mobile.orderId
	customer = self.session.custom.mobile.customer
	product  = self.session.custom.mobile.product
	model 	 = self.session.custom.mobile.model
	station  = self.session.custom.mobile.station
	qty 	 = self.session.custom.mobile.processingQty

	logger = system.util.getLogger("DatabaseConnection")
	
	try:
		
		stationOutQty = system.db.runNamedQuery('Read/ForProg/stationQty',{
			"orderId":order,
			"station":station,
			"type":"output"
		})
		
		outQty = 0 if stationOutQty.getRowCount() == 0 else stationOutQty[0][0]
		outCumQty = 0 if stationOutQty.getRowCount() == 0 else stationOutQty[0][1]

		stationInQty = system.db.runNamedQuery('Read/ForProg/stationQty',{
			"orderId":order,
			"station":station,
			"type":"input"
		})
		
		inQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][0]
		inCumQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][1]

		nextStation = system.db.runNamedQuery("Read/ForProg/nextStation",{
		    "station":station,
			"productName":product,
			"productModel":model
		})
		
		nextSt = None if nextStation.getRowCount() == 0 else nextStation[0][0]
		
	
		#2. Add qty to Output
		
		totalOutput = outQty + qty
		totalCumOutput = outCumQty + qty
		
		system.db.runNamedQuery('Write/updateQty',{
			"orderId": order,
			"station": station,
			"nextStation": nextSt,
			"qty":totalOutput,
			"cum_qty":totalCumOutput,
			"type":"output"
		})

		#3. Deduct qty  from Input

		totalInput = inQty - qty

		system.db.runNamedQuery('Write/updateQty',{
			"orderId": order,
			"station": station,
			"nextStation": None,
			"qty":totalInput,
			"cum_qty":inCumQty,
			"type":"input"
		})

		#4. After update DB, also update peers by sending message

		system.util.sendMessage(project='RunCad', messageHandler='qtyUpdate', payload={
			"orderId": order,
			"customer": customer,
			"stationIn": station,
			"newIn": totalInput,
			"stationOut": station,
			"newOut": totalOutput
			})

	except Exception as e:
        # Log the error
		logger.error("Error accessing database: " + str(e))
		
	#5. Prohibit user to press Input twice
	self.session.custom.mobile.validOrder = False
	self.session.custom.mobile.orderId = None
	self.session.custom.mobile.model = None
	self.session.custom.mobile.product = None
	self.session.custom.mobile.customer = None
	self.session.custom.mobile.incomingQty = None
	self.session.custom.mobile.processingQty = None

	#6. Navigate to History View
	system.perspective.navigate(view = "MainView/MobileHistory", params = {"station":station})