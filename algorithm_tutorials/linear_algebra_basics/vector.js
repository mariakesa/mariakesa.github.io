document.addEventListener("DOMContentLoaded", function () {
    // Select the container div
    const container = d3.select("#vector-container");

    // Set dimensions for the SVG square
    const width = 50;
    const height = 50;

    // Initialize the scalar value (integer by default)
    let scalarValue = getRandomInteger();

    // Create an SVG element
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Append a rectangle (square) to the SVG
    const square = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "vector-square");
});