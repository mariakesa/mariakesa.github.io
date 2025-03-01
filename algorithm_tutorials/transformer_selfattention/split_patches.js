document.addEventListener("DOMContentLoaded", function () {
    // Select the container div and set its position to relative so children can be absolutely positioned.
    const container = d3.select("#split-patches-container")
        .style("position", "relative")
        .style("width", "250px")
        .style("height", "200px");

    // Append the image element (always visible)
    const image = container.append("img")
        .attr("src", "bear.png")
        .attr("alt", "Bear Image")
        .attr("width", 250)
        .attr("height", 200)
        .style("display", "block");

    // Append the SVG element as an overlay, initially transparent
    const svg = container.append("svg")
        .attr("width", 250)
        .attr("height", 200)
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("pointer-events", "none")  // so that mouse events pass to the container/image
        .style("opacity", 0);

    // For demonstration, add a semi-transparent circle in the SVG.
    svg.append("circle")
        .attr("cx", 125) // center horizontally in the 250px wide container
        .attr("cy", 100) // center vertically in the 200px tall container
        .attr("r", 50)
        .attr("fill", "orange")
        .attr("fill-opacity", 0.5); // high transparency

    // Toggle the SVG overlay on hover by adjusting its opacity
    container.on("mouseover", function () {
            svg.transition().duration(200).style("opacity", 1);
        })
        .on("mouseout", function () {
            svg.transition().duration(200).style("opacity", 0);
        });
});
