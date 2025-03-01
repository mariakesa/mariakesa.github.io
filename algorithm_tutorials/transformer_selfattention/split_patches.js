document.addEventListener("DOMContentLoaded", function () {
    // Select the container div
    const container = d3.select("#split-patches-container");

    // Append the image element (initially visible)
    const image = container.append("img")
        .attr("src", "bear.png")
        .attr("alt", "Bear Image")
        .style("display", "block");

    // Append the SVG element (initially hidden)
    const svg = container.append("svg")
        .attr("width", 200)
        .attr("height", 200)
        .style("display", "none");

    // For demonstration, add a simple circle inside the SVG.
    svg.append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 50)
        .attr("fill", "orange");

    // Add hover events on the container to toggle visibility
    container.on("mouseover", function () {
            image.style("display", "none");
            svg.style("display", "block");
        })
        .on("mouseout", function () {
            svg.style("display", "none");
            image.style("display", "block");
        });
});
