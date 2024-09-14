		
	# 1. Read session variable

	order 	 = self.session.custom.mobile.validOrder
	customer = self.session.custom.mobile.customer
	product  = self.session.custom.mobile.product
	model 	 = self.session.custom.mobile.model
	station  = self.session.custom.mobile.station

	visible = [False, False, False, False]
	subName = ["","","",""]

	logger = system.util.getLogger("DatabaseConnection")
	
	try:
		# 2. Prepare substation name data, need to do before open the target page

		substation = system.db.runNamedQuery("Read/ForProgGui/substationFromStation", {"stCode":station}) 
		if substation.getRowCount() != 0:
			for row in substation:
				visible[row[0]-1] = True	# row data =>  [1, "Inspection"]
				subName[row[0]-1] = row[1]	#              [2, "Pre-Assembly"] 


		# 3. Update existing breakage qty.
		dbBreakage = system.db.runNamedQuery('Read/ForProg/stationOrderBreakage',{
					"orderId":order,
					"station":station})
					
		sumBreakage = 0 if dbBreakage[0][0] == None else dbBreakage[0][0]
				
	except Exception as e: # Log the error
		logger.error("Error accessing database: " + str(e))				

	# 4. Navigate to History View
	#    subName and sumBreakage is binded to display in target page	

	system.perspective.navigate(view = "MainView/MobileBreakage", params = {
		"visible":visible,
		"subName":subName,
		"sumBreakage":sumBreakage})