Date : 12 Sep 24
Purpose : Make the scanner apps that can interact with database server


==========================================
Step 1 : ++++++ ChatGPPT ++++++++++++

In order to port Ignition application to React Native apps. First, we need to make backend that mimics namequery concept.
Based on the code below :


import mysql.connector
from mysql.connector import Error
from collections import namedtuple

# ---- Namequery Definition -----

waitingIncoming_1 = """ """
orderDetailsFromId = """ """
orderInputQty= """ """
stationQty = """ """
previousStation = """ """
writeUpdateQty = """ """
nextStation = """ """

# ----- Function Definition --------
def runNamedQuery(database, query_text, params={}):
	try:
		# Database connection configuration
		connection = mysql.connector.connect(
			host='192.168.1.43',
			user='root',
			password='Ab370661#',
			database=database
		)

		# Substituting parameters in the query text
		for key, value in params.items():
			placeholder = f':{key}'
			if isinstance(value, str):
				value = f"'{value}'"
			query_text = query_text.replace(placeholder, str(value))
		
		print(query_text)

		# Create a cursor and execute the query
		cursor = connection.cursor()

		cursor.execute(query_text)
		
		# Fetch all the rows
		rows = cursor.fetchall()

		return rows

	except Error as e:
		print(f"Error: {e}")
		return None

	finally:
		if connection.is_connected():
			cursor.close()
			connection.close()
			
def runNamedQueryWrite(database, query_text, params={}):
	try:
		# Database connection configuration
		connection = mysql.connector.connect(
			host='192.168.1.43',
			user='root',
			password='Ab370661#',
			database=database
		)

		# Substituting parameters in the query text
		for key, value in params.items():
			placeholder = f':{key}'
			if isinstance(value, str):
				value = f"'{value}'"
			query_text = query_text.replace(placeholder, str(value))
		
		# print(query_text)

		# Create a cursor and execute the query
		cursor = connection.cursor()

		cursor.execute(query_text)
		
		connection.commit()
		
		return cursor.rowcount

	except Error as e:
		print(f"Error: {e}")
		return None

	finally:
		if connection.is_connected():
			cursor.close()
			connection.close()



Make this code into flask apps, the receive POST message contain 'queryName' and 'params' and then return result from database query back.


--->> Answer

from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Define the queries as global variables
queries = {
    'waitingIncoming_1': "YOUR SQL QUERY HERE",
    'orderDetailsFromId': "YOUR SQL QUERY HERE",
    'orderInputQty': "YOUR SQL QUERY HERE",
    'stationQty': "YOUR SQL QUERY HERE",
    'previousStation': "YOUR SQL QUERY HERE",
    'writeUpdateQty': "YOUR SQL QUERY HERE",
    'nextStation': "YOUR SQL QUERY HERE"
}

# Helper function to execute queries
def run_named_query(database, query_text, params):
    try:
        connection = mysql.connector.connect(
            host='192.168.1.43',
            user='root',
            password='Ab370661#',
            database=database
        )

        # Substituting parameters in the query text
        for key, value in params.items():
            placeholder = f':{key}'
            if isinstance(value, str):
                value = f"'{value}'"
            query_text = query_text.replace(placeholder, str(value))

        cursor = connection.cursor()
        cursor.execute(query_text)
        rows = cursor.fetchall()
        return rows

    except Error as e:
        print(f"Error: {e}")
        return None

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def run_named_query_write(database, query_text, params):
    try:
        connection = mysql.connector.connect(
            host='192.168.1.43',
            user='root',
            password='Ab370661#',
            database=database
        )

        # Substituting parameters in the query text
        for key, value in params.items():
            placeholder = f':{key}'
            if isinstance(value, str):
                value = f"'{value}'"
            query_text = query_text.replace(placeholder, str(value))

        cursor = connection.cursor()
        cursor.execute(query_text)
        connection.commit()
        return cursor.rowcount

    except Error as e:
        print(f"Error: {e}")
        return None

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    query_name = data.get('queryName')
    params = data.get('params', {})
    database = 'YOUR_DATABASE_NAME'  # Replace with your database name

    if query_name not in queries:
        return jsonify({"error": "Invalid queryName"}), 400

    query_text = queries[query_name]
    if query_name.startswith('write'):
        result = run_named_query_write(database, query_text, params)
    else:
        result = run_named_query(database, query_text, params)
    
    if result is None:
        return jsonify({"error": "Query failed"}), 500

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)


==========================================
Step 2 : ++++++ ChatGPPT ++++++++++++

Wrtie the React Native App (using Expo), that sent POST message to server '192.168.1.43:5011/query'
the body contains :
queryName : string represent query name
params : JSON string containing required parameter for SQL query







