// Function to create the initial plot
function createPlot(dataArray) {
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
  
    var svg = d3.select("#embedding_plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
  
    // Create line function
    var line = d3.line()
      .x(function(d, i) { return x(i); })  // i is the index of the array
      .y(function(d) { return y(d); });
  
    // Set domains based on your data
    x.domain([0, 768 - 1]);
    y.domain([
      d3.min(dataArray[0].values),
      d3.max(dataArray[0].values)
    ]);
  
    // Add x-axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  
    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Add the initial line
    svg.append("path")
      .data([dataArray[0]])
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); });
  
    return { svg, x, y, line }; // Return necessary elements for later use
  }
  
  // Function to update the plot
  function updatePlot(svgElements, dataArray, tick) {
    var x = svgElements.x;
    var y = svgElements.y;
    var line = svgElements.line;
  
    // Set domains based on your data
    x.domain([0, 768 - 1]);
    y.domain([
      d3.min(dataArray[tick].values),
      d3.max(dataArray[tick].values)
    ]);
  
    // Update the existing line
    svgElements.svg.select(".line")
      .data([dataArray[tick]])
      .attr("d", function(d) { return line(d.values); });
  }
  
  // Initial plot creation
  var dataArray;  // Initialize dataArray
  var tick = 0;   // Initialize tick
  
  // Call the main function to construct the initial plot
  var svgElements;
  d3.json("https://raw.githubusercontent.com/mariakesa/mariakesa.github.io/main/allen-project/data/clip_emb_test.json").then(function(data) {
    dataArray = Object.entries(data).map(([key, value]) => ({ time: key, values: value }));
    svgElements = createPlot(dataArray);
  
    // Update the plot every 2 seconds
    setInterval(function() {
      tick = (tick + 1) % dataArray.length;  // Increment tick and reset if it exceeds array length
      updatePlot(svgElements, dataArray, tick);
    }, 2000);
  });
  