var expression, exprCompile, xValues = [], yValues = []
var Canvas = document.getElementById('xy-graph')
var Ctx = null
var Width = Canvas.width
var Height = Canvas.height
var checkbox1 = document.querySelector("input[name=fprime]")
var checkbox2 = document.querySelector("input[name=f2prime]")
var checkboxStatus = 0

//These two blocks of code wait until a change occurs in either checkbox and acts accordingly
checkbox1.addEventListener( 'change', function(){
  if(this.checked){
    if(checkbox2.checked){
      checkboxStatus = 3
    }else {
      checkboxStatus = 1
    }
  }else{
    if(checkbox2.checked){
      checkboxStatus = 2
    }else {
      checkboxStatus = 0
    }
  }
})

checkbox2.addEventListener( 'change', function(){
  if(this.checked){
    if(checkbox1.checked){
      checkboxStatus = 3
    }else {
      checkboxStatus = 2
    }
  }else{
    if(checkbox1.checked){
      checkboxStatus = 1
    }else {
      checkboxStatus = 0
    }
  }
})

// Defines domain and range of the graph
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

 expression = document.getElementById('function').value
 expr = math.compile(expression)

 xValues = math.range(-10, 10, XSTEP).toArray()
 yValues = xValues.map(function (x) {
   return expr.eval({x: x})
 })

 if (Canvas.getContext) {
   Ctx = Canvas.getContext('2d')
   Ctx.clearRect(0,0,Width,Height)
   DrawAxes()
   switch(checkboxStatus){
     case 0:
      Graph()
       break;
     case 1:

       break;
     case 2:

       break;
     case 3:

       break;
     // If everything breaks and just doesn't work, it will just spit out a simple alert
     default:
       alert("Sorry, something went wrong")
   }
  } else {
    // Do nothing.
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

//Main drawing function
function Graph() {
  var first = true

  Ctx.beginPath()
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

//Just some user input handling
document.getElementById('form').onsubmit = function (event) {
  //Prevents an empty graph from showing up
  if(!document.getElementById('function').value.includes('x')){
    alert("Invalid entry, try a proper function")
    //Prevents automatic page refresh on click of button
    event.preventDefault()
  } else{
  event.preventDefault()
  Draw()
  }
}
