// Get checkboxes from the HTML side of things
var checkbox1 = document.querySelector("input[name=fprime]");
var checkbox2 = document.querySelector("input[name=f2prime]");

// All the necessary GLOBAL variables, these are accessible from all functions
var data;
var trace1, trace2, trace3;
var xValues, xValuesDerivative, yValuesPrime = [];
var expression;
var expr;
var checkboxStatus = 0;

//These two blocks of code wait until a change occurs in either checkbox and acts accordingly
checkbox1.addEventListener( 'change', function(){
  if(this.checked){
    if(checkbox2.checked){
      checkboxStatus = 3;
    }else {
      checkboxStatus = 1;
    }
  }else{
    if(checkbox2.checked){
      checkboxStatus = 2;
    }else {
      checkboxStatus = 0;
    }
  }
});

checkbox2.addEventListener( 'change', function(){
  if(this.checked){
    if(checkbox1.checked){
      checkboxStatus = 3;
    }else {
      checkboxStatus = 2;
    }
  }else{
    if(checkbox1.checked){
      checkboxStatus = 1;
    }else {
      checkboxStatus = 0;
    }
  }
});

// Takes the text from the textbox and cuts in up into a more usable form.
function parseAndCalculate(){
  try {
    expression = document.getElementById('eq').value
    expr = math.compile(expression)

    // Create arrays that will help us evaluate the function and its derivatives at 20,001 different x values. Having this many x values is a nice balance between speed and smoothness of the graph
    xValues = math.range(-10, 10, 0.001).toArray()
    xValuesDerivative = math.range(-10.001, 10.001, 0.001).toArray()
  }
  // This can obviously go wrong if you type in something stupid in the textbox so we just catch it and throw it where no one can see
  catch (err) {
    console.error(err)
    alert(err)
  }
}

// This evaluates the function you type in. It also sends the data to an array called trace1 which is for the graphing library used, Plotly.js
function original() {
    const yValues = xValues.map(function (x) {
      return expr.eval({x: x})
    })

    // Put the x values with the newly evaluated y values and put it in an array that is passed along to plotly.js at the end
    trace1 = {
      x: xValues,
      y: yValues,
      name: 'Original Function',
      type: 'scatter'
    }
}

// Calculates the first derivative.
function derive1(){
  //First it gets all the x values set up
  parseAndCalculate();
  // Evaluates those x vals and gets the y vals
  const yVals = xValuesDerivative.map(function (x) {
    return expr.eval({x: x})
  })
  var counter = 0; //must be equal to 20001 at the end because we are using 20001 x Values
  // Go through each and every one of the 20001 x values and y values
  for(i = 0; i < xValuesDerivative.length; i++){
    //Because we are using a set number of points, we have to limit it
    if(counter < 20002){
      // calculate the slope between them using (y2 - y1)/(x2 - x1)
      yValuesPrime[counter] = (yVals[i+2] - yVals[i])/(xValuesDerivative[i+2] - xValuesDerivative[i]);
      counter++;
    }
  }
  // Again, this just collects the values into one big array to pass onto plotly.js
  trace2 = {
    x: xValues,
    y: yValuesPrime,
    name: 'First Derivative',
    type: 'scatter',
  }
}

function secondDerivative(){
  const exprDerivative2 = math.derivative(math.derivative(expression, 'x'), 'x');
  const yValuesDerivative2 = xValues.map(function (x) {
    return exprDerivative2.eval({x: x})
  })

  trace3 = {
    x: xValues,
    y: yValuesDerivative2,
    name: 'Second Derivative',
    type: 'scatter'
  }
}

//Sends the info to plotly.js and graphs the function for us
function plot(){
  //This sets up the basic design aspects that we need
  var layout = {
    autosize: true,
    width: window.innerWidth,
    height: window.innerHeight,
    hovermode: false,
    xaxis:{
      autotick: false,
      ticks: 'outside',
      tick0: 0,
      dtick: 1,
      ticklen: 4,
      tickwidth: 1,
      tickcolor: '#000'
    },
    yaxis: {
      autotick: false,
      ticks: 'outside',
      tick0: 0,
      dtick: 1,
      ticklen:4,
      tickwidth: 1,
      tickcolor: '#000'
    }
  }

  //Calls the various calculation methods programmed above to generate the values that need to be graphed depending on what the user selected.
  parseAndCalculate();
  // The original function is always calculated and graphed, no matter what the user selects.
  original();
  switch(checkboxStatus){
    case 0:
    // Each "data =" statement again puts all the value arrays into one bigger array that is taken by plotly.js
      data = [trace1];
      break;
    case 1:
      derive1();
      data = [trace1, trace2];
      break;
    case 2:
      secondDerivative();
      data = [trace1, trace2];
      break;
    case 3:
      derive1();
      secondDerivative();
      data = [trace1, trace2, trace3];
      break;
    // If everything breaks and just doesn't work, it will atleast try to just graph the original function
    default:
      data = [trace1];
  }

  //Calls for Plotly.js to do its thing and graph our points
  Plotly.newPlot('plot', data,layout)
}

//This handles the Graph button and waits for you to press the button before graphing.
document.getElementById('form').onsubmit = function (event) {
  event.preventDefault()
  plot()
}
