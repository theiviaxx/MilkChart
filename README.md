MilkChart
=========

MilkChart is released under the MIT license. It is simple and easy to understand and places almost no restrictions on what you can do with MilkChart.
[More Information](http://en.wikipedia.org/wiki/MIT_License)

This library will generate a graph similar to Microsoft Excel.

![Screenshot](http://www.brettdixon.com/static/i/column.jpg)

How to use
----------

To transform a table of data into a chart, simply create a MilkChart object of the chart type you wish passing in the table id and an object containing options for the chart.

Table structure:

	<table id="chart">
	    <thead>
	        <tr>
	            <th>Column A</th><th>Column B</th><th>Column C</th><th>Column D</th> 
	        </tr>
	    </thead>
	    <tbody>
	        <tr><td>8.3</td><td>70</td><td>10.3</td><td>100</td></tr>
	        <tr><td>8.6</td><td>65</td><td>10.3</td><td>125</td></tr>
	        <tr><td>8.8</td><td>63</td><td>10.2</td><td>106</td></tr>
	        <tr><td>10.5</td><td>72</td><td>16.4</td><td>162</td></tr>
	        <tr><td>11.1</td><td>80</td><td>22.6</td><td>89</td></tr>
	    
	    </tbody>
	    <tfoot>
	        <tr>
	            <td>Row 1</td><td>Row 2</td><td>Row 3</td><td>Row 4</td><td>Row 5</td>
	        </tr>
	    </tfoot>
	</table>
	
* NOTE: The ``<tfoot>`` tag is optional.  This is where row names are stored.  If it's not important, they will be named Row # by default.

The JavaScript:

	window.addEvent('domready', function() {
	    var chart = new MilkChart.Column("chart");
	})

MilkChart Options
-----------------
You can pass several ``options`` to the MilkChart chart object constructors. Each of the options has a default value.

 * width - (int: Defaults to 400) Width of chart in px
 * height - (int: Defaults to 280) Height of chart in px
 * padding - (int: Defaults to 12) Outer padding of chart in px
 * font - (string: Defaults to "Verdana") Font to be used for labels
 * fontColor - (string: Defaults to #000000) Color used for labels
 * fontSize - (int: Defaults to 10) Font size in pt
 * background - (string: Defaults to #ffffff) Background color of chart
 * chartLineColor - (string: Defaults to #333333) Color of value lines
 * chartLineWeight - (int: Defaults to 1) Line Wieght of value lines in px
 * border - (bool: Defaults to true) Draws a border around edge chart (ignores padding)
 * borderWeight - (int: Defaults to 1) Border width in px
 * borderColor - (string: Defaults to #333333) Border color
 * titleSize - (int: Defaults to 18) Size of title font in pt
 * titleFont - (string: Defaults to "Verdana") Font used for title
 * titleColor - (string: Defaults to #000000) Font color for title
 * showRowNames - (bool: Defaults to true) Show the row labels on one of the axes
 * showValues - (bool: Defaults to true) Show values on one of the axes
 * showKey - (bool: Defaults to true) Shows the column labels
 * useZero - (bool: Defaults to true) Always use 0 as the lowest value
 * copy - (bool: Defaults to false) Whether or not to hide the table or not
 * clean - (bool: Defaults to false) Creates a copy of the table, cleaned of spurious elements added by Table.Paginate and/or Table.Sort. Automatically turned on if the supplied table's thead contains more than one row, as is when Table.Paginate is used.
 
MilkChart Classes
-----------------
These are the available classes MilkChart provides and their additional options.

* Column
  - columnBorder - (bool:Defaults to false) Draws borders around each column
  - columnBorderWeight - (int:Defaults to 2) Width of border in pixels
  - columnBorderColor - (string:Defaults to #000000) Color of the border
  - skipLabel  - (int: Defaults to 0) Display every Nth label
  - labelTicks - (bool:Defaults to false) Draw tick marks on the X-axis
  - rotateLabels - (int: Defaults to 0) Force rotation of label text. 65, 90, and 115 produce nice looking results
  - rowTicks - (bool:Defaults to true) Draw tick marks on the Y-axis
* Bar
* Line
  - showTicks - (bool:Defaults to false) Draw tick marks at each value
  - showLines - (bool:Defaults to true) Draw lines connecting values
  - lineWeight - (int: Defaults to 3) Line weight in px
  - skipLabel  - (int: Defaults to 0) Display every Nth label
  - labelTicks - (bool:Defaults to false) Draw tick marks on the X-axis
  - rotateLabels - (int: Defaults to 0) Force rotation of label text. 65, 90, and 115 produce nice looking results
  - rowTicks - (bool:Defaults to true) Draw tick marks on the Y-axis
* Scatter
  - showTicks - (bool:Defaults to true) Draw tick marks at each value
  - showLines - (bool:Defaults to false) Draw lines connecting values
* Pie
  - stroke - (bool Defaults to true) Stroke the pie chart
  - strokeWeight - (int: Defaults to 2) Stroke weight in px
  - strokeColor - (string: Defaults to "#000000") Font color on pie slices
  - shadow - (bool: Defaults to false) Draw a shadow under the pie chart
  - showPercentages - (bool: Defaults to true) Draw slice percentage
  - chartLineWeight - (int: Defaults to 2) Outline line weight in px
  - pieBorder - (bool: Defaults to false) Draw a border around pie
* Doughnut

AJAX Loading(JSON)
------------------
You can call the `load` method on any MilkChart type to load a JSON dataset from a url.  It accepts the same options as Request, except for onSuccess.
  
Chart Colors
------------
For the chart colors, your can specify a list of colors and it will repeat those as needed.  You can also specify a single color and MilkChart will create a gradient as needed.  Or you can supply two colors to create a gradient between.

Screenshots
-----------

![Column Chart](http://www.brettdixon.com/static/i/column.jpg)
![Bar Chart](http://www.brettdixon.com/static/i/bar.jpg)
![Line Chart](http://www.brettdixon.com/static/i/line.jpg)
![Scatter Chart](http://www.brettdixon.com/static/i/scatter.jpg)
![Pie Chart](http://www.brettdixon.com/static/i/pie.jpg)
![Doughnut Chart](http://www.brettdixon.com/static/i/doughnut.jpg)
