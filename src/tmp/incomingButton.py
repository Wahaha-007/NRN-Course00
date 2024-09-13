
	#1. Prepare necessary variable
	order 	 = self.session.custom.mobile.orderId
	customer = self.session.custom.mobile.customer
	product  = self.session.custom.mobile.product
	model 	 = self.session.custom.mobile.model
	station  = self.session.custom.mobile.station
	qty 	 = self.session.custom.mobile.incomingQty

	logger = system.util.getLogger("DatabaseConnection")
	
	try:
		# We have this value in session since barcode scanning. Re-read database again when we really need to use data.
		
		stationInQty = system.db.runNamedQuery('Read/ForProg/stationQty',{
			"orderId":order,
			"station":station,
			"type":"input"
		})
		
		#  If machine input value of this order for the first time

		inQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][0]
		inCumQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][1]
		
		prevStation = system.db.runNamedQuery('Read/ForProg/previousStation',{
			"nextStation":station,
			"productModel":model,
			"productName":product
		})
		
		prevStation = prevStation[0][0]
		
		system.tag.writeBlocking(['[default]MyTag'], [order])
		system.tag.writeBlocking(['[default]MyTag1'], [prevStation])
		
		prevStationOutQty = system.db.runNamedQuery('Read/ForProg/stationQty',{
			"orderId":order,
			"station":prevStation,
			"type":"output"
		})
		
		system.tag.writeBlocking(['[default]MyTag2'], [prevStationOutQty])
		
		# It is sure to always have previous station data

		prevOutQty = prevStationOutQty[0][0]
		prevOutCumQty = prevStationOutQty[0][1]
		

		#2. Add qty to current station
		
		totalInput = inQty + qty
		totalCumInput = inCumQty + qty
		
		system.db.runNamedQuery('Write/updateQty',{
			"orderId": order,
			"station": station,
			"nextStation": None,
			"qty":totalInput,
			"cum_qty":totalCumInput,
			"type":"input"
		})

		#3. Deduct qty  from previous station

		totalPrevOutput = prevOutQty - qty

		system.db.runNamedQuery('Write/updateQty',{
			"orderId": order,
			"station": prevStation,
			"nextStation":station,
			"qty":totalPrevOutput,
			"cum_qty":prevOutCumQty,
			"type":"output"
		})

		#4. After update DB, also update peers by sending message

		system.util.sendMessage(project='RunCad', messageHandler='qtyUpdate', payload={
			"orderId": order,
			"customer": customer,
			"stationIn": station,
			"newIn": totalInput,
			"stationOut": prevStation,
			"newOut": totalPrevOutput
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