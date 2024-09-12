Date : 11 Sep 24
Purpose : Learn to implement SocketIO in React Native

-------------------------------------------------

Step 1: Install necessary
npm install socket.io-client
npm install react-native-reanimated

-------------------------------------------------

Step 2: ++++Prepare to talk with ChatGPT, ++++++

In order to port web application to React Native apps. Please Make the React Screen, function MachineScreen(), to match the Web version.
The Apps should do the following task (compare to its web version)

- It connect to Websocket server at 192.168.1.43:5010
- The Web version use socketIO library : "https://cdn.socket.io/4.0.0/socket.io.min.js"
- The Web got 3 events
  1. socket.on('initial_data', ...  
     Server send data contain string of list of JSON in the format
     { 
       "mode": 0, "fromDate" : "2024-09-08 16:58:44", "machine": 1, 
       "line" : 1, "status" : 200, "sensor": 0, "count": 107, "bar": [214, 215, 212, 219, 193, 214, 183, 208, 217, 183]
      }
    
     The list will have 21 elements, from machine 0 to machine 20

  2. socket.on('update_status', .....

     Server send just 1 JSON to up date data of 1 machine, there will be no key "count" "sensor" and "bar"

  3. socket.on('update_count', ....

     Server send just 1 JSON to up date data of 1 machine, there will be no key "status" and "line"

- Apps will be table to display the real time update information to user.
  The table has column : 'machine', 'line', 'status', 'since', 'count'
  for column 'machine', 'line', 'status', 'count' , the table get data from incoming JSON.
  for column 'since', it calculate the time different in minute between now and 'fromDate' from JSON. The data in tis column will update itself every minutes.

 --------------------------------------------------------------------------

Step 3 : โปรแกรมที่จะต้องเตรียมก่อน

$ redis-server
$ redis-cli
$ /Projects/redis/gunicorn -w 1 -k eventlet -b 0.0.0.0:5007 GenDataUD21:app
$ /Projects/redis/gunicorn -w 1 -k eventlet -b 0.0.0.0:5010 ViewMachine:app
gunicorn -w 1 -k eventlet -b 0.0.0.0:5008 GenDataSC21:app

ต้องทำ Port forward + Allow firewall ไว้ก่อนที่ 192.168.1.43: 5010 ด้วย

at Window powershell as Admin
netsh interface portproxy add v4tov4 listenport=5010 listenaddress=0.0.0.0 connectport=5010 connectaddress=172.22.143.85
netsh interface portproxy show all

-------------------------------------------------------------------------------

Step 4 : ต้อง Manual แก้ Bug ให้ 

diff --git a/node_modules/react-native-table-component/components/rows.js b/node_modules/react-native-table-component/components/rows.js
index 40cecc6..b096fe4 100644
--- a/node_modules/react-native-table-component/components/rows.js
+++ b/node_modules/react-native-table-component/components/rows.js
@@ -26,7 +26,8 @@ export class Row extends Component {
               width={wth}
               height={height}
               flex={flex}
-              textStyle={[cellTextStyle && cellTextStyle(item), textStyle]}
+              // textStyle={[cellTextStyle && cellTextStyle(item), textStyle]}
+              textStyle={{...(cellTextStyle ? cellTextStyle(item) : {}), ...textStyle}}
               {...props}
             />
           );

---------------------------------------------------------------------------------
Step 5 : แก้เรื่อง Update time แล้วเป็น N/A

Please make the following update.
1. Since there are 3 lines of machines, any way to make user easy to separate them in the table ?
2. The 'since' column appear correctly just when we first connect, after the first update (after 1 minute) all rows  of this column show 'N/A'
3. Base on the variable :
      // Mapping status to color and text
      const statusDefinitions = {
        200: { text: 'Running', color: '#83CC21' },
        210: { text: 'Idle', color: '#F9F733' },
        220: { text: 'Setup', color: '#00C3FF' },
        230: { text: 'Wait Material', color: '#FFA500' },
        300: { text: 'Maintenance', color: '#A66DD0' },
        310: { text: 'Calibration', color: '#808080' },
        320: { text: 'Break', color: '#1E90FF' },
        330: { text: 'Shift Change', color: '#17AF91' },
        400: { text: 'Machine Down', color: '#ED6112' },
        410: { text: 'Power Failure', color: '#FF0000' },
        420: { text: 'Emergency Stop', color: '#FF6347' },
        430: { text: 'Quality Issue', color: '#8B0000' },
        440: { text: 'Oper Absence', color: '#FF410C' },
        500: { text: 'No Connection ', color: '#A9A9A9' },
      };
in 'status' column, do not display number, but display text coresponding to that number also the text color must follow the above definition.

4. Add small circle as the first column of each line, this circle color is the same as status color.
5. When there is value change, do some animation like flashing that cell for 1 cycle.
6. Add clock on top-right corner format is HH:MM:ss