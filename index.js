const canvas=d3.select(".canvas")

var w = 100,
    h = 100,
    z = 20,
    x = 100 / z,
    y = 100 / z;

var svg = canvas.append("svg")
    .attr("width", w)
    .attr("height", h);

var receptive_field = canvas.append("img")
  .attr('id', "receptive_field")
  .attr('width', 300)
  .attr('height', 300)
  .attr("src", "./img/ensemble_rf/ensemble_rf_0.png")
  .attr('align','center')

svg.selectAll("rect")
    .data(d3.range(x * y))
    .enter().append("rect")
    .attr("transform", translate)
    .attr("width", z)
    .attr("height", z)
    .style("fill", function(d) { return d3.hsl(d % x / x * 360, 1, Math.floor(d / x) / y); })
    .on("click", mouseover);



function translate(d) {
      return "translate(" + (d % x) * z + "," + Math.floor(d / x) * z + ")";
}

function mouseover(d) {
      d3.select(this)
      console.log(d)
      image=d3.select("#receptive_field")
        .attr("src", "./img/ensemble_rf/ensemble_rf_"+d+".png")
    }
