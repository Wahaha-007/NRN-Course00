Date : 13 Sep 24
Purpose : To make the group of scanner page

===================================================
Step 1 : Make wipe screen effect for this group
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