document.addEventListener("DOMContentLoaded", function () {
    // Select the container div and set its position to relative
    const container = d3.select("#linear-QKV-container")
        .style("position", "relative")
        .style("width", "250px")
        .style("height", "200px"); // ensure container has defined dimensions

    // Append the SVG element positioned absolutely relative to the container
    const svg = container.append("svg")
        .attr("width", 250)
        .attr("height", 200)
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("pointer-events", "none")
        .style("opacity", 1); // set to 1 for testing visibility

    // Append a semi-transparent rectangle to the SVG
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 250)
        .attr("height", 200)
        .attr("fill", "orange")
        .attr("fill-opacity", 0.5);
});
