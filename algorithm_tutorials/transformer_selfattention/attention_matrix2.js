document.addEventListener("DOMContentLoaded", function () {
    // Prevent duplicate execution
    if (window.hasRenderedAttentionMatrix) {
        return;
    }
    window.hasRenderedAttentionMatrix = true; // Set flag so it runs only once

    const numRows = 20;
    const numCols = 20;
    const cellSize = 10; // Adjusted for visibility
    const spacing = 10; // Space between index column and matrix
    const topSpacing = 20; // Space for the horizontal index row

    // **Remove any existing SVG (Fixes duplicate matrix issue)**
    d3.select("#attention-matrix-container-2").selectAll("svg").remove();

    // Total width accounts for the index column + spacing + matrix
    const totalWidth = (numCols + 1) * (cellSize + 1) + spacing + 100;
    const totalHeight = numRows * (cellSize + 1) + topSpacing; // Add space for the top row

    // **Seeded Random Number Generator (for reproducible values)**
    function seededRandom(seed) {
        let value = seed;
        return function () {
            value = (value * 16807) % 2147483647;
            return value / 2147483647; // Normalize to range [0, 1]
        };
    }

    // Initialize generator with a fixed seed
    const rng = seededRandom(42);

    // **Precompute Attention Scores with a Fixed Seed**
    const attentionScores = [];
    for (let row = 0; row < numRows; row++) {
        const rowScores = [];
        for (let col = 0; col < numCols; col++) {
            const score = row === col ? 0.9 : rng(); // Diagonal is strong, others are random
            rowScores.push(score);
        }
        attentionScores.push(rowScores);
    }

    console.log("Precomputed Attention Scores:", attentionScores); // Log to console for reference

    // **Expose the attention scores globally so another script can use them**
    window.attentionScores = attentionScores;

    // **Create the SVG container**
    const svg = d3.select("#attention-matrix-container-2")
        .append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight);

    // **Append a text element for hover display**
    const hoverText = svg.append("text")
        .attr("x", totalWidth - 90) // Position to the right of the grid
        .attr("y", cellSize + 15) // Start near the top
        .attr("font-size", "16px")
        .attr("fill", "DarkBlue")
        .style("visibility", "hidden") // Initially hidden
        .style("font-weight", "bold");

    // **Color Mapping**
    const colorMap = {
        0: "turquoise", 1: "red", 2: "blue", 3: "green", 4: "purple",
        5: "cyan", 6: "magenta", 7: "yellow", 8: "brown", 9: "pink",
        10: "orange", 11: "teal", 12: "gold", 13: "lime", 14: "navy",
        15: "maroon", 16: "olive", 17: "violet", 18: "indigo", 19: "coral"
    };

    // **Create the Top Index Row**
    for (let col = 0; col < numCols; col++) {
        svg.append("rect")
            .attr("x", (col + 1) * (cellSize + 1) + spacing) // Offset by index column
            .attr("y", 0) // Topmost row
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colorMap[col % 20]) // Alternate colors horizontally
            .attr("fill-opacity", 0.5) // Only fill is transparent
            .attr("stroke", "black") // Black border remains fully visible
            .attr("stroke-width", 1);
    }

    // **Create the Left Index Column**
    for (let row = 0; row < numRows; row++) {
        svg.append("rect")
            .attr("x", 0) // Leftmost column
            .attr("y", row * (cellSize + 1) + topSpacing) // Shift down to align with main matrix
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colorMap[row % 20]) // Alternate colors vertically
            .attr("fill-opacity", 0.5) // Only fill is transparent
            .attr("stroke", "black") // Black border remains fully visible
            .attr("stroke-width", 1);
    }

    // **Create the Main Attention Matrix (Using Precomputed Scores)**
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const score = attentionScores[row][col]; // Use precomputed attention score

            svg.append("rect")
                .attr("x", (col + 1) * (cellSize + 1) + spacing) // Offset by index column and spacing
                .attr("y", row * (cellSize + 1) + topSpacing) // Shift down for the top row
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("fill", "pink") // Inside is pink
                .attr("fill-opacity", score) // Use precomputed attention score
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
