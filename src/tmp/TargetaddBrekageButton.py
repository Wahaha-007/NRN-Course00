	#1. Prepare variable got from main page
	
	order 	 = self.session.custom.mobile.orderId
	customer = self.session.custom.mobile.customer
	station  = self.session.custom.mobile.station
	product  = self.session.custom.mobile.product
	model 	 = self.session.custom.mobile.model
	operator = 'Peter'

	#2. Prepare variable got from user input
	qty = [0,0,0,0]
	byHuman = [False,False,False,False]
	byMachine = [False,False,False,False]
	byProcess = [False,False,False,False]

	namePrefix = "subView"

	lotBreakageInput = 0

	for i in range(4):
		name = namePrefix + str(i+1)
		qty[i] = self.getSibling(name).props.params.qty
		byHuman[i] = self.getSibling(name).props.params.byHuman
		byMachine[i] = self.getSibling(name).props.params.byMachine
		byProcess[i] = self.getSibling(name).props.params.byProcess
		lotBreakageInput += qty[i]

	if (lotBreakageInput > self.session.custom.mobile.processingQty) or (lotBreakageInput == 0):
		# system.perspective.openPopup("ID_BREAKAGE_FAIL","SubView/InvalidInputBreakage")
		return

	logger = system.util.getLogger("DatabaseConnection")

	#3. If pass basic condition check, write all data to breakage DB, maximum 4 row (for 4 substations)
	try:
		
		prevStation = system.db.runNamedQuery('Read/ForProg/previousStation',{
			"nextStation":station,
			"productModel":model,
			"productName":product
		})
		
		prevStation = prevStation[0][0]

		for i in range(4):
			if (self.view.params.visible[i]) and (qty[i] != 0):
				 system.db.runNamedQuery('Write/addBreakage',{
					"orderId":order,
					"station":station,
					"subStation":i,
					"prevStation":prevStation,
					"operator":operator,
					"qty":qty[i],
					"byHuman":byHuman[i],
					"byMachine":byMachine[i],
					"byProcess":byProcess[i],
					"byOther":not (byHuman[i] or byMachine[i] or byProcess[i])})
		

		#4. Update total breakage from Db to display, also used as input confirmation

		dbBreakage = system.db.runNamedQuery('Read/ForProg/stationOrderBreakage',{
					"orderId":order,
					"station":station})

		self.view.params.sumBreakage = 0 if dbBreakage[0][0] == None else dbBreakage[0][0]

		#5. Change inQty of station

		stationInQty = system.db.runNamedQuery('Read/ForProg/stationQty',{
			"orderId":order,
			"station":station,
			"type":"input"
		})
	
		inQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][0]
		inCumQty = 0 if stationInQty.getRowCount() == 0 else stationInQty[0][1]

		totalInput = inQty - lotBreakageInput
		self.session.custom.mobile.processingQty = totalInput
		totalCumInput = inCumQty
		
		system.db.runNamedQuery('Write/updateQty',{
			"orderId": order,
			"station": station,
			"nextStation": None,
			"qty":totalInput,
			"cum_qty":totalCumInput,
			"type":"input"
		})

		#6. After update DB, also update peers by sending message

		system.util.sendMessage(project='RunCad', messageHandler='qtyUpdate', payload={
			"orderId": order,
			"customer": customer,
			"stationIn": station,
			"newIn": totalInput,
			"stationOut": "Breakage",
			"newOut": self.view.params.sumBreakage
			})

		#7. Reset the input qty for all subsation to 0, make sure for bi-directional binding
	
		for i in range(4):
			name = namePrefix + str(i+1)
			self.getSibling(name).props.params.qty = 0
			self.getSibling(name).props.params.byHuman = False
			self.getSibling(name).props.params.byMachine = False
			self.getSibling(name).props.params.byProcess = False

	except Exception as e: # Log the error
		logger.error("Error accessing database: " + str(e))