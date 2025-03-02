document.addEventListener("DOMContentLoaded", function () {
    const numRows = 20;
    const numCols = 20;
    const cellSize = 10; // Adjusted for visibility

    // Select the container and append an SVG
    const svg = d3.select("#attention-matrix-container-2")
        .append("svg")
        .attr("width", numCols * (cellSize + 1) + 100) // Extra space for text display
        .attr("height", numRows * (cellSize + 1));

    // Append a text element for hover display
    const hoverText = svg.append("text")
        .attr("x", numCols * (cellSize + 1) + 10) // Position to the right of the grid
        .attr("y", cellSize) // Start near the top
        .attr("font-size", "16px")
        .attr("fill", "DarkBlue")
        .style("visibility", "hidden") // Initially hidden
        .style("font-weight", "bold");

    const colorMap = {
        0: "turquoise", 1: "red", 2: "blue", 3: "green", 4: "purple",
        5: "cyan", 6: "magenta", 7: "yellow", 8: "brown", 9: "pink",
        10: "orange", 11: "teal", 12: "gold", 13: "lime", 14: "navy",
        15: "maroon", 16: "olive", 17: "violet", 18: "indigo", 19: "coral"
    };

    // Create the grid using SVG rect elements
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            svg.append("rect")
                .attr("x", col * (cellSize + 1)) // Spacing to ensure border visibility
                .attr("y", row * (cellSize + 1))
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("fill", colorMap[col % 20]) // Alternate colors across columns
                .attr("fill-opacity", 0.5) // Only fill is transparent
                .attr("stroke", "black") // Black border remains fully visible
                .attr("stroke-width", 1)
                .on("mouseover", function () {
                    hoverText.text(`A(${row}, ${col})`)
                        .style("visibility", "visible");
                })
                .on("mouseout", function () {
                    hoverText.style("visibility", "hidden");
                });
        }
    }
});
