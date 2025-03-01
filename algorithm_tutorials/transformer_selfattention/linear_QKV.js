document.addEventListener("DOMContentLoaded", function () {
    // Select the container div and set its position to relative
    const container = d3.select("#linear-QKV-container")
        .style("position", "relative")
        .style("width", "250px")
        .style("height", "100px"); // ensure container has defined dimensions

    // Append the SVG element positioned absolutely relative to the container
    const svg = container.append("svg")
        .attr("width", 250)
        .attr("height", 100)
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("pointer-events", "none")
        .style("opacity", 1); // set to 1 for testing visibility

    // Append a semi-transparent rectangle to the SVG
    svg.append("rect")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 50)
        .attr("height", 40)
        .attr("fill", "orange")
        .attr("fill-opacity", 0.5);

    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 25)
        .attr("x2", 90)
        .attr("y2", 25)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 40)
        .attr("x2", 90)
        .attr("y2", 40)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 55)
        .attr("x2", 90)
        .attr("y2", 55)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

});
