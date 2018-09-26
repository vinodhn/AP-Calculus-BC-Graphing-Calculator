// Sets up the global variables that most of the methods below access and use.
var expression, exprCompile, xValues = [], yValues = [], xValuesD = [], xValuesFTC = [], yValuesD = [], yValuesD2 = [], yValuesPOI = []
var Canvas = document.getElementById('xy-graph')
var Ctx = null
var Width = Canvas.width
var Height = Canvas.height
var checkbox1 = document.querySelector("input[name=fprime]")
var checkbox2 = document.querySelector("input[name=f2prime]")
var checkbox3 = document.querySelector("input[name=minmax]")
var checkbox4 = document.querySelector("input[name=poi]")
var checkbox5 = document.querySelector("input[name=ftc]")

//We need this because the input boxes need to be dynamically changed. Just having them enabled all the time could cause problems
checkbox5.addEventListener( 'change', function() {
  if(this.checked){
    document.getElementById("point1").disabled = false;
    document.getElementById("point2").disabled = false;
  }else{
    //make sure that no rogue input goes into system
    document.getElementById("point1").disabled = true;
    document.getElementById("point2").disabled = true;
  }
})

//Sets up the graphs range and domain
function MaxX() {
  return 10
}

function MinX() {
  return -10
}

function MaxY() {
  return MaxX() * Height / Width
}

function MinY() {
   return MinX() * Height / Width
}

// Converts the x-value from the domain of the user-inputted function
function XC(x) {
  return (x - MinX()) / (MaxX() - MinX()) * Width
}

// Converts the y-value from the range of the user-inputted function
function YC(y) {
  return Height - (y - MinY()) / (MaxY() - MinY()) * Height
}


//Main function: this handles all the parsing and calculating.
function Draw() {
  //first get the raw string from your input
 expression = document.getElementById('function').value

//then use our math.js library to parse it up and make it easy to calculate values
 if(expression.indexOf("ln(") > -1){
   var newExpr = expression.replace("ln","log")
   expr = math.compile(newExpr)
 }else if(expression.indexOf("log(") > -1){
   var exp = expression.substring(expression.indexOf("log(")+4, expression.indexOf(")"))
   var newExp = "log(" + exp + ", 10)"
   expr = math.compile(newExp)
 }else{
 expr = math.compile(expression)
}

 //Fills in the x value arrays we defined at the top
 xValues = math.range(-10, 10, XSTEP).toArray()
 xValuesD = math.range(-10-XSTEP, 10+XSTEP, XSTEP).toArray()

 //quickly solves for the yValues at a bunch of different x points
 yValues = xValues.map(function (x) {
   return expr.eval({x: x})
 })

 //needs to be done twice because this one gets modified later
 yValuesD = xValuesD.map(function (x) {
   return expr.eval({x: x})
 })

//The REAL main part of this entire document: checks to see what you've selected as your options and does each one, one by one, in order
 if (Canvas.getContext) {
   Ctx = Canvas.getContext('2d')
   Ctx.clearRect(0,0,Width,Height)
   DrawAxes()
   Graph();
   if(checkbox1.checked){
     GraphPrime();
   }

   if(checkbox2.checked){
     GraphPrime2();
   }

   if(checkbox3.checked){
     GraphMinMax();
   }

   if(checkbox4.checked){
     GraphPOI();
   }

   if(checkbox5.checked){
     CalcFTC();
   }

}
}

//Deltas are distance between tick marks -- used only for drawing the axes
function XTickDelta() {
  return 1
}

function YTickDelta() {
  return 1
}


//Self explanatory
function DrawAxes() {
 Ctx.save()
 Ctx.lineWidth = 2

 //Postive Y axis
 Ctx.beginPath()
 Ctx.moveTo(XC(0),YC(0))
 Ctx.lineTo(XC(0),YC(MaxY()))
 Ctx.strokeStyle = '#000000'
 Ctx.stroke()

 //Nevative Y axis
 Ctx.beginPath()
 Ctx.moveTo(XC(0),YC(0))
 Ctx.lineTo(XC(0),YC(MinY()))
 Ctx.stroke()

 //Y axis tick marks
 var delta = YTickDelta()
 for (var i = 1;(i * delta) < MaxY();++i) {
  Ctx.beginPath()
  Ctx.moveTo(XC(0) - 5,YC(i * delta))
  Ctx.lineTo(XC(0) + 5,YC(i * delta))
  Ctx.strokeStyle = '#000000'
  Ctx.stroke()
 }

 var delta = YTickDelta()
 for (var i = 1;(i * delta) > MinY();--i) {
  Ctx.beginPath()
  Ctx.moveTo(XC(0) - 5,YC(i * delta))
  Ctx.lineTo(XC(0) + 5,YC(i * delta))
  Ctx.strokeStyle = '#000000'
  Ctx.stroke()
 }

 //Positive X axis
 Ctx.beginPath()
 Ctx.moveTo(XC(0),YC(0))
 Ctx.lineTo(XC(MaxX()),YC(0))
 Ctx.stroke()

 //Negative X axis
 Ctx.beginPath()
 Ctx.moveTo(XC(0),YC(0))
 Ctx.lineTo(XC(MinX()),YC(0))
 Ctx.stroke()

 //X tick marks
 var delta = XTickDelta()
 for (var i = 1;(i * delta) < MaxX();++i) {
  Ctx.beginPath()
  Ctx.moveTo(XC(i * delta),YC(0)-5)
  Ctx.lineTo(XC(i * delta),YC(0)+5)
  Ctx.strokeStyle = '#000000'
  Ctx.stroke()
 }

 var delta = XTickDelta()
 for (var i = 1;(i * delta) > MinX();--i) {
  Ctx.beginPath()
  Ctx.moveTo(XC(i * delta),YC(0)-5)
  Ctx.lineTo(XC(i * delta),YC(0)+5)
  Ctx.strokeStyle = '#000000'
  Ctx.stroke()
 }

//Draws in the light gray lines that can make it easier to make out points. First lines at each X val then each Y val.
for(var i = -10;  i<11; i++){
  Ctx.lineWidth = 1;
  Ctx.beginPath();
  Ctx.strokeStyle = '#c0c0c0'
  Ctx.moveTo(XC(i),0);
  Ctx.lineTo(XC(i),Height)
  Ctx.stroke();
}

for(var i = -10;  i<11; i++){
  Ctx.lineWidth = 1;
  Ctx.beginPath();
  Ctx.strokeStyle = '#c0c0c0'
  Ctx.moveTo(0,YC(i));
  Ctx.lineTo(Width,YC(i))
  Ctx.stroke();
}
 Ctx.restore()
}


//Aka deltaX
var XSTEP = MaxX()/10000

//Graph the original function
function Graph() {
  var first = true

  Ctx.beginPath()
  Ctx.fillStyle = '#000000'
  for (var i = 0;i < xValues.length;i++) {
   var x = xValues[i]
   var y = yValues[i]
   if (first) {
    Ctx.moveTo(XC(x),YC(y))
    first = false
   } else {
    Ctx.fillRect(XC(x),YC(y),1,1)
   }
  }
  Ctx.stroke()
}

//Calculate and Graph Derivative
function GraphPrime() {
  var first = true

  Ctx.beginPath()
  Ctx.fillStyle = '#FF0000'
  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD[i], y1 = yValuesD[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(first) {
      Ctx.moveTo(XC(x),YC(y))
      first = false
    } else {
      Ctx.fillRect(XC(x), YC(y), 1, 1)
    }
  }
  Ctx.stroke()
}

//Calculate and Graph Derivative 2
function GraphPrime2() {
  var first = true

  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD[i], y1 = yValuesD[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(i < xValues.length){
      yValuesD2[i] = y
    }
  }

  Ctx.beginPath()
  Ctx.fillStyle = '#0000FF'
  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD2[i], y1 = yValuesD2[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(first) {
      Ctx.moveTo(XC(x),YC(y))
      first = false
    } else {
      Ctx.fillRect(XC(x), YC(y), 1, 1)
    }
  }
  Ctx.stroke()
}

//Calulate first derivative, see where it equals zero, and then draw markers at those points on the original function
function GraphMinMax() {

  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD[i], y1 = yValuesD[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(i < xValues.length){
      yValuesD2[i] = Math.round(y*1000)/1000;
    }
  }

  Ctx.beginPath()
  Ctx.fillStyle = '#00FF00'
  for(var i = 0; i < xValuesD.length; i++){
    if(Math.round(yValuesD2[i]* 1000)/1000 == 0.000){
      var x = Math.round(xValuesD[i+1] * 10000)/ 10000
      var y = Math.round(yValues[i+1] * 10000) / 10000
      Ctx.moveTo(XC(x),YC(y))
      Ctx.fillRect(XC(x), YC(y), 1, 3)
    }
  }
  Ctx.stroke()
}

//Calculate the second derivative and see where it equals zero and then draw marker on the original graph
function GraphPOI(){

  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD[i], y1 = yValuesD[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(i < xValues.length){
      yValuesD2[i] = y
    }
  }

  for(var i = 0; i < xValuesD.length;i++){
    var x = xValuesD[i+1]
    var y2 = yValuesD2[i], y1 = yValuesD2[i+2]
    var x2 = xValuesD[i], x1 = xValuesD[i+2]
    var y = (y2-y1)/(x2-x1)
    if(i < xValues.length){
      yValuesPOI[i] = Math.round(y*10000)/10000;
    }
  }

  Ctx.beginPath()
  Ctx.fillStyle = '#FFD700'
  for(var i = 0; i < xValuesD.length; i++){
    if(Math.round(yValuesPOI[i]* 1000)/1000 == 0.000){
      var x = Math.round(xValuesD[i+1] * 10000)/ 10000
      var y = Math.round(yValues[i+1] * 10000) / 10000
      Ctx.moveTo(XC(x),YC(y))
      Ctx.fillRect(XC(x), YC(y), 1, 3)
    }
  }
  Ctx.stroke()
}

//First round the x values in the array to make it easier to compare values, find the index in the x value array that matches the x values you inputted
//Then find the y values at those indexes, then subtract them and display the calculated rounded value at the end
function CalcFTC(){

  for(var i = 0; i < xValuesD.length;i++){
    xValuesFTC[i] = (Math.round(xValuesD[i] * 10000)/10000)
  }

  var x1 = parseInt(document.getElementById("point1").value);
  var x2 = parseInt(document.getElementById("point2").value);

  var i1 = xValuesFTC.indexOf(x1);
  var i2 = xValuesFTC.indexOf(x2);

  var y2 = yValuesD[i2]
  var y1 = yValuesD[i1];

  var finalFTCVal = Math.round(y2 - y1);

  document.getElementById("ftcVal").innerText = "Calculated FTC Value: " + finalFTCVal

}
