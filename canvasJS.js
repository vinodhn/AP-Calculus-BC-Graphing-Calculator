// Sets up the global variables that most of the methods below access and use.
var expression, exprCompile, xValues = [],
    yValues = [],
    xValuesD = [],
    xValuesFTC = [],
    yValuesD = [],
    yValuesD2 = [],
    yValuesPOI = [],
    yValuesFTC = []
var Canvas = document.getElementById('xy-graph')
var Ctx = null
var Width = Canvas.width
var Height = Canvas.height
var checkbox1 = document.querySelector("input[name=fprime]")
var checkbox2 = document.querySelector("input[name=f2prime]")
var checkbox3 = document.querySelector("input[name=minmax]")
var checkbox4 = document.querySelector("input[name=poi]")
var checkbox5 = document.querySelector("input[name=ftc]")
var checkbox6 = document.querySelector("input[name=holes]")
var dialog = document.querySelector('#dialog');
if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
}
dialog.querySelector('button:not([disabled])')
    .addEventListener('click', function() {
        dialog.close();
    });

//We need this because the input boxes need to be dynamically changed. Just having them enabled all the time could cause problems
checkbox5.addEventListener('change', function() {
    if (this.checked) {
        document.getElementById("point1").disabled = false;
        document.getElementById("point2").disabled = false;
    } else {
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
    if (expression.indexOf("ln(") > -1) {
        var newExpr = expression.replace("ln", "log")
        expr = math.compile(newExpr)
    } else if (expression.indexOf("log(") > -1) {
        var exp = expression.substring(expression.indexOf("log(") + 4, expression.indexOf(")"))
        var newExp = "log(" + exp + ", 10)"
        expr = math.compile(newExp)
    } else {
        expr = math.compile(expression)
    }

    //Fills in the x value arrays we defined at the top
    xValues = math.range(-10, 10, XSTEP).toArray()
    xValuesD = math.range(-10 - XSTEP, 10 + XSTEP, XSTEP).toArray()

    //quickly solves for the yValues at a bunch of different x points
    yValues = xValues.map(function(x) {
        return expr.eval({
            x: x
        })
    })

    //needs to be done twice because this one gets modified later
    yValuesD = xValuesD.map(function(x) {
        return expr.eval({
            x: x
        })
    })

    //The REAL main part of this entire document: checks to see what you've selected as your options and does each one, one by one, in order
    if (Canvas.getContext) {
        Ctx = Canvas.getContext('2d')
        Ctx.clearRect(0, 0, Width, Height)
        DrawAxes()//Axes are always drawn
        Graph();//Function is always graphed
        if(checkbox6.checked){
            CalcHoles();
        }

        if (checkbox1.checked) {
            GraphPrime();
        }

        if (checkbox2.checked) {
            GraphPrime2();
        }

        if (checkbox3.checked) {
            GraphMinMax();
        }

        if (checkbox4.checked) {
            GraphPOI();
        }

        if (checkbox5.checked) {
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
    Ctx.moveTo(XC(0), YC(MinY()))
    Ctx.lineTo(XC(0), YC(MaxY()))
    Ctx.strokeStyle = '#000000'
    Ctx.stroke()

    //Nevative Y axis
    Ctx.beginPath()
    Ctx.moveTo(XC(0), YC(0))
    Ctx.lineTo(XC(0), YC(MinY()))
    Ctx.stroke()

    //Y axis tick marks
    var delta = YTickDelta()
    for (var i = 1;
        (i * delta) < MaxY(); ++i) {
        Ctx.beginPath()
        Ctx.moveTo(XC(0) - 5, YC(i * delta))
        Ctx.lineTo(XC(0) + 5, YC(i * delta))
        Ctx.strokeStyle = '#000000'
        Ctx.stroke()
    }

    var delta = YTickDelta()
    for (var i = 1;
        (i * delta) > MinY(); --i) {
        Ctx.beginPath()
        Ctx.moveTo(XC(0) - 5, YC(i * delta))
        Ctx.lineTo(XC(0) + 5, YC(i * delta))
        Ctx.strokeStyle = '#000000'
        Ctx.stroke()
    }

    //Positive X axis
    Ctx.beginPath()
    Ctx.moveTo(XC(0), YC(0))
    Ctx.lineTo(XC(MaxX()), YC(0))
    Ctx.stroke()

    //Negative X axis
    Ctx.beginPath()
    Ctx.moveTo(XC(0), YC(0))
    Ctx.lineTo(XC(MinX()), YC(0))
    Ctx.stroke()

    //X tick marks
    var delta = XTickDelta()
    for (var i = 1;
        (i * delta) < MaxX(); ++i) {
        Ctx.beginPath()
        Ctx.moveTo(XC(i * delta), YC(0) - 5)
        Ctx.lineTo(XC(i * delta), YC(0) + 5)
        Ctx.strokeStyle = '#000000'
        Ctx.stroke()
    }

    var delta = XTickDelta()
    for (var i = 1;
        (i * delta) > MinX(); --i) {
        Ctx.beginPath()
        Ctx.moveTo(XC(i * delta), YC(0) - 5)
        Ctx.lineTo(XC(i * delta), YC(0) + 5)
        Ctx.strokeStyle = '#000000'
        Ctx.stroke()
    }

    //Draws in the light gray lines that can make it easier to make out points. First lines at each X val then each Y val.
    for (var i = -10; i < 11; i++) {
        Ctx.lineWidth = 1;
        Ctx.beginPath();
        Ctx.strokeStyle = '#c0c0c0'
        Ctx.moveTo(XC(i), 0);
        Ctx.lineTo(XC(i), Height)
        Ctx.stroke();
    }

    for (var i = -10; i < 11; i++) {
        Ctx.lineWidth = 1;
        Ctx.beginPath();
        Ctx.strokeStyle = '#c0c0c0'
        Ctx.moveTo(0, YC(i));
        Ctx.lineTo(Width, YC(i))
        Ctx.stroke();
    }
    Ctx.restore()
}


//Aka the dx in the integral
var XSTEP = MaxX() / 10000

//Graph the original function
function Graph() {
    var first = true

    Ctx.beginPath()
    Ctx.fillStyle = '#000000'
    for (var i = 0; i < xValues.length; i++) {
        var x = xValues[i]
        var y = yValues[i]
        if (first) {
            Ctx.moveTo(XC(x), YC(y))
            first = false
        } else {
            Ctx.fillRect(XC(x), YC(y), 1, 1)
        }
    }
    Ctx.stroke()
}

//Calculate and Graph Derivative
function GraphPrime() {
    var first = true

    Ctx.beginPath()
    Ctx.fillStyle = '#FF0000'
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD[i],
            y1 = yValuesD[i + 2]// find the y values at the x values mentioned below
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]// we find the x values around the x we are looking at
        var y = (y2 - y1) / (x2 - x1)//Slope formula
        if (first) {
            Ctx.moveTo(XC(x), YC(y))
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

    //We always assume that the first derivative hasn't been calculated and so we calculate that first
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD[i],
            y1 = yValuesD[i + 2]
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]
        var y = (y2 - y1) / (x2 - x1)
        if (i < xValues.length) {
            yValuesD2[i] = y
        }
    }

    Ctx.beginPath()
    Ctx.fillStyle = '#0000FF'
    //Then we calculate the second derivative and draw our 1x1 squares.
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD2[i],
            y1 = yValuesD2[i + 2]
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]
        var y = (y2 - y1) / (x2 - x1)
        if (first) {
            Ctx.moveTo(XC(x), YC(y))
            first = false
        } else {
            Ctx.fillRect(XC(x), YC(y), 1, 1)
        }
    }
    Ctx.stroke()
}

//Extrema
function GraphMinMax() {

    //Again, assume first derivative hasn't been calculated and round values we calculate.
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD[i],
            y1 = yValuesD[i + 2]
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]
        var y = (y2 - y1) / (x2 - x1)
        if (i < xValues.length) {
            yValuesD2[i] = Math.round(y * 1000) / 1000;
        }
    }

    Ctx.beginPath()
    Ctx.fillStyle = '#00FF00'
    //Interate through all the rounded values from before and find which one equals 0 and where it equals 0 on the x-axis.
    for (var i = 0; i < xValuesD.length; i++) {
        if (Math.round(yValuesD2[i] * 1000) / 1000 == 0.000) {
            var x = Math.round(xValuesD[i + 1] * 10000) / 10000
            var y = Math.round(yValues[i + 1] * 10000) / 10000
            Ctx.moveTo(XC(x), YC(y))
            Ctx.fillRect(XC(x), YC(y), 1, 3)
        }
    }
    Ctx.stroke()
}

//Points of Inflection
function GraphPOI() {
    //Calculate first derivative
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD[i],
            y1 = yValuesD[i + 2]
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]
        var y = (y2 - y1) / (x2 - x1)
        if (i < xValues.length) {
            yValuesD2[i] = y
        }
    }
    //Using first derivative calculate second derivative
    for (var i = 0; i < xValuesD.length; i++) {
        var x = xValuesD[i + 1]
        var y2 = yValuesD2[i],
            y1 = yValuesD2[i + 2]
        var x2 = xValuesD[i],
            x1 = xValuesD[i + 2]
        var y = (y2 - y1) / (x2 - x1)
        if (i < xValues.length) {
            yValuesPOI[i] = Math.round(y * 10000) / 10000;
        }
    }

    Ctx.beginPath()
    Ctx.fillStyle = '#FFD700'
    //Again, find where the second derivative = 0 and where on the x-axis = 0.
    for (var i = 0; i < xValuesD.length; i++) {
        if (Math.round(yValuesPOI[i] * 1000) / 1000 == 0.000) {
            var x = Math.round(xValuesD[i + 1] * 10000) / 10000
            var y = Math.round(yValues[i + 1] * 10000) / 10000
            Ctx.moveTo(XC(x), YC(y))
            Ctx.fillRect(XC(x), YC(y), 1, 3)
        }
    }
    Ctx.stroke()
}

//FTC
function CalcFTC(){
  //Calculate the first derivative and round any x and y values we will use
  for (var i = 0; i < xValuesD.length; i++) {
      xValuesFTC[i] = (Math.round(xValuesD[i] * 10000) / 10000)
      var x = xValuesD[i + 1]
      var y2 = yValuesD[i],
          y1 = yValuesD[i + 2]
      var x2 = xValuesD[i],
          x1 = xValuesD[i + 2]
      var y = (y2 - y1) / (x2 - x1)
      if (i < xValues.length) {
          yValuesFTC[i] = Math.round(y)*10000/10000
      }
  }

  var x1 = parseInt(document.getElementById("point1").value);
  var x2 = parseInt(document.getElementById("point2").value);
  //Find the indexes the user inputed on our arrays
  var lowerIndex = xValuesFTC.indexOf(x1);
  var upperIndex = xValuesFTC.indexOf(x2);

  var ftcValue = 0;
  //Calculate the areas of tiny rectangeles 0.001 units wide and accumulate them
  for(var i = lowerIndex; i <=upperIndex; i++){
    ftcValue += yValuesFTC[i]*XSTEP
  }

  ftcValue = Math.round(ftcValue)*10000/10000

  //Output
  var snackbarContainer = document.querySelector("#snackbarCont");
  if (ftcValue != NaN) {
      var data = {
          message: 'Calculated FTC Value: ' + ftcValue
      };
  } else {
      var data = {
          message: 'Cannot calculate FTC, invalid input.'
      };
  }
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

//Split function at forward slash. If it doesn't have one, it'll ignore the function
function CalcHoles(){
    var splitIndex = expression.indexOf("/")
    if(splitIndex == -1){
      var snackbarContainer = document.querySelector("#snackbarCont");
      var data = {
        message: "Function does not have discontinuities or holes."
      }
      snackbarContainer.MaterialSnackbar.showSnackbar(data);
      return;
    } else {
      console.log("Hole may exist")
    }
    var firstExpression = expression.substring(0,splitIndex)
    var firstExpr = math.compile(firstExpression)
    var secondExpression = expression.substring(splitIndex +1)
    var secondExpr = math.compile(secondExpression)

    var firstY = [], secondY = []
    firstY = xValues.map(function(x) {
        return firstExpr.eval({
            x: x
        })
    })

    secondY = xValues.map(function(x) {
        return secondExpr.eval({
            x: x
        })
    })

    var holes = [], disconts = []

    for (var i = 0; i < xValues.length; i++) {
        if(Math.round(secondY[i] * 10000) / 10000 == 0.000){
          console.log("Hole here at " + Math.round(xValues[i] * 10000)/10000)
          holes[i] = (Math.round(xValues[i] * 10000)/10000)
        }
        if ((Math.round(firstY[i] * 10000) / 10000 == 0.000) && (Math.round(secondY[i] * 10000) / 10000 == 0.000)) {
            console.log("Removable discontinuity here at " + Math.round(xValues[i] * 10000)/10000)
            disconts[i] = (Math.round(xValues[i] * 10000)/10000)
            console.log(disconts[i])
        }
    }

    var holesMsg = "Hole(s) at: ";
    var discontsMsg = "Discontinuity(ies) at: "
    for(var i = 0; i < holes.length; i++){
      if(holes[i] != null){
      holesMsg = holesMsg + holes[i] + " ";
      }
    }
    for(var i = 0; i < disconts.length; i++){
      if(disconts[i] != null){
      discontsMsg = discontsMsg +  disconts[i] + " ";
      }
    }
    var snackbarContainer = document.querySelector("#snackbarCont");
    var data = { message: holesMsg + "\n " + discontsMsg}
    snackbarContainer.MaterialSnackbar.showSnackbar(data);

}

//For the info button
function showDiag() {
    dialog.showModal();
}

window.onload = function() {
    document.getElementById("point1").disabled = true;
    document.getElementById("point2").disabled = true;
}
