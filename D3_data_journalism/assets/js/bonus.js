
//create variables for SVG chart dimensions for easy use
var svgHeight=600 //500
var svgWidth= 1000//720 //1000
//could 

// create margin variable for easy reference
var margin = {
    top: 20, 
    right: 40,
    bottom: 80,
    left: 100
};

// find chartsize using above ref
var chartHeight=svgHeight-margin.top-margin.bottom;
var chartWidth=svgWidth-margin.left-margin.right;


// append an svg to the html 
var svg = d3.select("#scatter")
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)
            .attr("class", "chart")

// create chart group for easy formatting all at once
var chartGroup = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)

//Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "smokes";


//function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d =>d[chosenXAxis]) * 1.0
    ])
    .range([0, chartWidth]);
  
  return xLinearScale;
};

//function for updating xAxis var when you click axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  
  return xAxis;
}

//function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  //create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d =>d[chosenYAxis]) * 1.
    ])
    .range([chartHeight,0]);
  
  return yLinearScale;
};

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);


  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
  
}



//update circles group with a transition to new circles
function renderXCircles(circleGroup, newXScale, chosenXAxis) {

  circleGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    // .attr("cy", d => newYScale(d[chosenYAxis]));

  return circleGroup;
};

function renderYCircles(circleGroup, newYScale, chosenYAxis) {

  circleGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circleGroup;
}
//update circle group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circleGroup) {
  var xlabel;

  if (chosenXAxis === "age") {
    xlabel = "Age:";
  } else if (chosenXAxis === "poverty"){
    xlabel = "In Poverty (%):";
  } else  {
    xlabel = "Household Income (Median): ";
  }
  var ylabel;

  if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%):";
  } else if (chosenYAxis === "obesity"){
    ylabel = "Obesity (%):";
  } else  {
    ylabel = "Lacks Healthcare (%): ";
  };

  //create tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -70])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  chartGroup.call(toolTip);

  circleGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })

    //onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    return circleGroup;
  }

// read csv
d3.csv("D3_data_journalism/assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;
//parse data as integers
  censusData.forEach(function(data) {
      data.age = +data.age;
      data.poverty = +data.poverty;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
  });

  //xLinearScale fucntion above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  //create y scale 
  var yLinearScale = yScale(censusData, chosenYAxis);

  //create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //append x axis

  var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

  var yAxis = chartGroup.append("g")
                .call(leftAxis);
    
    // append a circle to the svg for each datapoint
  var circleGroup = chartGroup.selectAll("null")
                      .data(censusData)
                      .enter()
                      .append("circle")
                      .attr("cx", d => xLinearScale(d[chosenXAxis]))
                      .attr("cy", d => yLinearScale(d[chosenYAxis]))
                      .attr("r", "15")
                      .attr("fill", "blue")      
                      .attr("class", "stateCircle");  

//append text to chart group for each data point
  var stateAbbr = chartGroup.selectAll(null)
  .data(censusData)
  .enter()
  .append("text");
              
  stateAbbr
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .text(d => (d['abbr']))
      .attr("class", "stateText")
      .attr("font-size", "9px")

  //create group for two x-axis labels
  var xLabelsGroup = chartGroup.append('g')
                              .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`);
  //create and locate individual x labels
  var povertyLabel = xLabelsGroup.append("text")
                                  .attr("x", 0)
                                  .attr("y", 20)
                                  .attr("value", "poverty")
                                  .classed("active", true)
                                  .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
                              .attr("x", 0)
                              .attr("y", 40)
                              .attr("value", "age")
                              .classed("inactive", true)
                              .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 60)
                                .attr("value", "income")
                                .classed("inactive", true)
                                .text("Household Income (Median)");

  //append y labels
  var yLabelsGroup = chartGroup.append("g")
                    .attr("transform", "rotate(-90)")
                    // .attr("y", 0 - (margin.left)+40)
                    // .attr("x", 0 - (svgHeight / 2))
                    // .attr("dy", "1em")
                    // .attr("padding", 0.1)
                    // .attr("class", "axisText")
                              // .attr("transform", `translate(${0-(margin.left+10)},0`)
                              // .attr("y", 0-margin.left)
                              // .attr("x", 0-(chartHeight/2))
                              // .attr("dy", "1em")
                              // .classed("aText", true)

  //create and locate individual y labels
  var obesityLabel = yLabelsGroup.append("text")
                                  .attr("y", 0 - (margin.left)+40)
                                  .attr("x", 0 - (chartHeight / 2))
                                  .attr("value", "obesity")
                                  .classed("inactive", true)
                                  .text("Obese (%)");

  var smokerLabel = yLabelsGroup.append("text")
                            .attr("y", 0 - (margin.left)+20)
                            .attr("x", 0 - (chartHeight / 2))
                            .attr("value", "smokes")
                            .classed("active", true)
                            .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
                              .attr("y", 0 - (margin.left)+60)
                              .attr("x", 0 - (chartHeight / 2))
                              .attr("value", "healthcare")
                              .classed("inactive", true)
                              .text("Lacks Healthcare (%)");

  //updateToolTip function above import
  var circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

  //x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);
        
        // updates circles with new x values
        circleGroup = renderXCircles(circleGroup, xLinearScale, chosenXAxis);

        //update text
        stateAbbr
        .transition()
        .duration(1000)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => (d['abbr']))
        .attr("class", "stateText")
        .attr("font-size", "9px")
        // updates tooltips with new info
        circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        } 
      }
    })
      //y axis labels event listener
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;


      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);
      
      // updates circles with new x values
      circleGroup = renderYCircles(circleGroup, yLinearScale, chosenYAxis);
      
      //update text
      stateAbbr
      .transition()
      .duration(1000)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .text(d => (d['abbr']))
      .attr("class", "stateText")
      .attr("font-size", "9px")

      // updates tooltips with new info
      circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

      // change active label to bold text
      if (chosenYAxis === "smokes") {
        smokerLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        smokerLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "healthcare") {
        smokerLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      } 
    }
  })  

});
