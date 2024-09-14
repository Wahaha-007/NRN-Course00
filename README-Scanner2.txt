Date : 13 Sep 24
Purpose : To make the group of scanner page

===================================================
Step 1 : ทำ Swipe navigation ให้ group Scanner และ เพิ่มหน้า TaskDisplayScreen
$ npm install @react-navigation/native @react-navigation/material-top-tabs react-native-pager-view react-native-gesture-handler


Create React Native screen (TaskDisplayScreen) with the following spec :-
1. Create StyleSheet for black theme.
2. The screen is divided into 2 sections vertically.
   The upper half section composes of text
                < Var 1>  Waiting
   And then the table (I will call it 'up table').

   The Lower half section composes of text
                < Var 2>  Processing
   And then the table (I will call it 'low table').
3. The data for 'up table' will be 2D array of (n row x 3 columns)
   The column names are : 'orderId', 'Station', 'Qty'
   Make the 2D array data provider as separate funtion. Now, that function just returns mock data in the above format.
	 I will replace the content of this function later.

4. Var1 value is the sum of 'Qty' of every rows in 'up table'

5. The data for 'down table' will be 2D array of (n row x 3 columns)
   The column names are : 'orderId', 'Qty', 'Breakage'
   Make the 2D array data provider as separate funtion. Now, that function just returns mock data in the above format.
	 I will replace the content of this function later.

6. Var2 value is the sum of 'Qty' of every rows in 'down table'

7. Make the screen responsive.

==========================================================================

14 Sep24 ทำเพิ่มหน้า BreakageInputScreen

Step 1: 

Create React Native screen (TaskDisplayScreen) with the following spec :-
1. The screen has layout as uploaded image.
2. 'Station' display value of string var station
3. Sub0 - Sub3 display value of array var sub[0] - Sub[3]
4. User Can input number of breakage into the input box, there are totally 4 boxes for 4 sub stations => qty[i], i = 0..3
5. For each substation, user can also click the icon to specify if the reason for breakage is from human, Machine or Process.
   The icon links to boolean var and the icon color change according to boolean value.byHuman[i], byMachine[i], byProcess[i] where i = 0..3
   Then we will send the data collected from user to update database

   
Answer --->>>

1. Install iconlib

npm install @expo/vector-icons

2. Use it 

import { FontAwesome } from '@expo/vector-icons';

<FontAwesome name="user" size={24} color="gray" />

3. See code in 'BreakageInputScreen.js'


   
   
  