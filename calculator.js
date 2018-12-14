//AP Calculus BC Graphing Calculator Project

//Global Variable Setup
var WIDTH = 800
var HEIGHT = 800
var LINES = 20
var DX = 0.001

var canvas = document.getElementById("graph")
var ctx = canvas.getContext("2d")
var colors = ["#00688B", "#660000", "#9900CC", "#E68A2E", "#006600", "#FF33CC"]
var currentColorIndex = 0

var checkbox1 = document.querySelector("input[name=first]")
var checkbox2 = document.querySelector("input[name=second]")
var checkbox3 = document.querySelector("input[name=extrema]")
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
function showDiag(){
  dialog.showModal()
}

//We need this because the input boxes need to be dynamically changed. Makes the UI seem more friendly
checkbox5.addEventListener('change', function() {
    if (this.checked) {
        document.getElementById("ftcDiv").style.display="block"
        document.getElementById("point1").disabled = false;
        document.getElementById("point2").disabled = false;
    } else {
        document.getElementById("ftcDiv").style.display="none"
        document.getElementById("point1").disabled = true;
        document.getElementById("point2").disabled = true;
    }
})

function initialize(){
  //First fill in the grid and then the axes
  ctx.fillStyle = "#c0c0c0"
  for(var i = 0; i < LINES; i++){
    ctx.fillRect(WIDTH/LINES * i,0,1,HEIGHT)
    ctx.fillRect(0,HEIGHT/LINES * i, WIDTH, 1)
  }

  ctx.fillStyle = "#707070"
  ctx.fillRect(WIDTH/2 - 2, 0, 4, HEIGHT)
  ctx.fillRect(0,HEIGHT/2 -2, WIDTH, 4)
}

function plotPoint(x,y, color, width){
  if(color === undefined){
    color = colors[0]
  }
  if(width === undefined){
    width = 2
  }

  x = WIDTH*(0.5 + x / LINES)
  y = HEIGHT*(0.5 - y / LINES)

  ctx.fillStyle = color;
  ctx.fillRect(x - width/2, y - width / 2, width, width)
}

function generateGraph(functionString){
  var compiledFunction = math.compile(functionString)

  //Various variables to help calculate first derivative, second derivative, extrema, POIs, and FTC.
  var previousPoint = NaN;
  var previousSlope = NaN;
  var direction = NaN;
  var accel = NaN;
  var numberOfReferencePoints = 0;
  var previousColorIndex = 0;
  var lowerFTCBound = parseInt(document.getElementById("point1").value);
  var higherFTCBound = parseInt(document.getElementById("point2").value);
  var firstFTCValue = 0;
  var secondFTCValue = 0;
  var firstFTCFilled = false;
  var secondFTCFilled = false;
  var calculated = false;
  var displayed = false;
  //The main drawing loop
  for(var i = -10/DX; i < 10/DX; i++){
    //evaluate function at the x value it is currently on
    var x = i * DX
    var y = compiledFunction.eval({x: x})

    var undefined = false
    if(!isFinite(y) || isNaN(y)){
      undefined = true;
    }

    //First Derivative
    if(previousPoint != NaN){
      var slope = (y - previousPoint) / DX
      if(checkbox1.checked){ plotPoint(x,slope, "#000000")}
    }

    previousPoint = y

    //Relative Extrema
    if(direction != NaN){
      if(slope != 0 && direction != 0){
        //See if function changes direction
        if(slope / Math.abs(slope) != direction / Math.abs(direction)){
          previousColorIndex = currentColorIndex
          if(checkbox3.checked){
            currentColorIndex = (currentColorIndex + 1) % colors.length
          }
          //When it does, change the color the function is graphed in and plot a marker
          if(previousColorIndex != currentColorIndex){
            plotPoint(x,y, colors[previousColorIndex],10)
            if(x.toFixed(1) != -10.0 ){ console.log("Extrema: ( " + x.toFixed(1) + ", " + Math.round(y*100)/100 + ")") }
          }
        }
      }
    }

    //Calculate the direction of the function
    if(slope != 0){
      direction = slope / Math.abs(slope)
    }

    //Second derivative
    if(previousSlope != NaN){
      var secondSlope = Math.round(((slope) - (previousSlope)) / DX * 10000000) / 10000000
      if(checkbox2.checked){
        plotPoint(x,secondSlope, "#FF0000")
      }
    }

    previousSlope = slope

    //If the point exists,
    if(!undefined){
      //And the function changes direction here, plot a point and print it out
      if(secondSlope / Math.abs(secondSlope) != accel && !(secondSlope == 0 && isNaN(accel))){
        if(checkbox4.checked){
          if(numberOfReferencePoints > 2){
            plotPoint(x,y, "#000000", 10);
            if(x.toFixed(1) != -10.0 ){ console.log("POI: ( " + x.toFixed(1) + ", " + Math.round(y*100)/100 + ")") }
          }
          else{
            numberOfReferencePoints++
          }
        }
      }
    } else {
      numberOfReferencePoints = 0;
    }

    //Acceleration is basically just calculating direction but its for the second derivative
    accel = secondSlope / Math.abs(secondSlope)

    //FTC
    if(checkbox5.checked && !calculated){
      //If the X the loop is on is the lower and then upper bounds, it will fill them up
      if(x == lowerFTCBound){
        firstFTCValue = y
        firstFTCFilled = true
      }
      if(x == higherFTCBound){
        secondFTCValue = y
        secondFTCFilled = true
      }
      //Then just subtract the two y values as shown by the FTC defintion
      if(firstFTCFilled && secondFTCFilled){
        var calculatedFtcValue = secondFTCValue - firstFTCValue
        var snackbarContainer = document.querySelector("#snackbarCont");
        var data = { message: "FTC Value: " + calculatedFtcValue}
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
        console.log(calculatedFtcValue)
        calculated = true
      }
    }

    //Removable Discontinuities
    if(functionString.indexOf("/") != -1){
      //Split function at fraction bar
      var splitIndex = functionString.indexOf("/")
      var firstFunction = math.compile(functionString.substring(0,splitIndex))
      var secondFunction = math.compile(functionString.substring(splitIndex+1))
      //Evaluate each separately
      var bottomY = firstFunction.eval({x: x})
      var topY = secondFunction.eval({x : x})
      var topX = NaN, bottomX = NaN
      //If they are 0, capture that X value
      if(bottomY == 0){
        bottomX = x
      }
      if(topY == 0){
        topX = x
      }
      //If the captured X values are the same, there is a removable discontinuity there
      if(bottomX == topX){
        var snackbarContainer = document.querySelector("#snackbarCont");
        var data = { message: "Removable discontinuity at x=" + x}
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
      }

    }else if(!displayed){
      var snackbarContainer = document.querySelector("#snackbarCont");
      var data = { message: "Not a rational function"}
      snackbarContainer.MaterialSnackbar.showSnackbar(data);
      displayed = true;
    }

    plotPoint(x,y, colors[currentColorIndex])
  }

}

function buttonClick(){
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  initialize();
  var unparsed = document.getElementById("function").value;

  generateGraph(unparsed);
}

initialize()
