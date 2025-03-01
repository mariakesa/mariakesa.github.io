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
        .style("opacity", 1);

    // Define an arrow marker in a <defs> section
    svg.append("defs")
        .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
        .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z")
            .attr("fill", "black");

    // Replace the three plain lines with three arrow lines by adding marker-end
    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 25)
        .attr("x2", 90)
        .attr("y2", 25)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 40)
        .attr("x2", 90)
        .attr("y2", 40)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.append("line")
        .attr("x1", 75)
        .attr("y1", 55)
        .attr("x2", 90)
        .attr("y2", 55)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    // Create the three small rectangles (for Q, K, and V) after the arrows
    // Their positions: x = 110, y = 20, 35, and 50 respectively.
    svg.append("rect")
        .attr("x", 110)
        .attr("y", 20)
        .attr("width", 30)
        .attr("height", 10)
        .attr("fill", "lightblue");

    svg.append("rect")
        .attr("x", 110)
        .attr("y", 35)
        .attr("width", 30)
        .attr("height", 10)
        .attr("fill", "pink");

    svg.append("rect")
        .attr("x", 110)
        .attr("y", 50)
        .attr("width", 30)
        .attr("height", 10)
        .attr("fill", "lightgreen");

    // Define a color dictionary mapping numbers 1-20 to colors for the main rectangle
    const colorMap = {
        1: "red",
        2: "blue",
        3: "green",
        4: "purple",
        5: "cyan",
        6: "magenta",
        7: "yellow",
        8: "brown",
        9: "pink",
        10: "orange",
        11: "teal",
        12: "gold",
        13: "lime",
        14: "navy",
        15: "maroon",
        16: "olive",
        17: "violet",
        18: "indigo",
        19: "coral",
        20: "turquoise"
    };

    // Append the animated main rectangle
    const animatedRect = svg.append("rect")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 50)
        .attr("height", 40)
        .attr("fill", colorMap[1])
        .attr("fill-opacity", 0.5);

    // Append a text element to display the number in the main rectangle (centered)
    const mainText = svg.append("text")
        .attr("x", 20 + 25) // center horizontally
        .attr("y", 20 + 20) // center vertically (approx)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-size", "14px")
        .text("1");

    // Create text elements for the small rectangles with smaller font sizes.
    // Compute centers for each small rectangle.
    const textQ = svg.append("text")
        .attr("x", 110 + 15) // center of the first rect (lightblue)
        .attr("y", 20 + 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-size", "10px")
        .text("Q1");

    const textK = svg.append("text")
        .attr("x", 110 + 15) // center of the second rect (pink)
        .attr("y", 35 + 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-size", "10px")
        .text("K1");

    const textV = svg.append("text")
        .attr("x", 110 + 15) // center of the third rect (green)
        .attr("y", 50 + 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-size", "10px")
        .text("V1");

    // Initialize counter
    let counter = 1;

    // Set up an interval to update the main rectangle's color and number every second,
    // and also update the labels in the small rectangles.
    d3.interval(function() {
        // Update the main rectangle's fill color with a smooth transition
        animatedRect.transition().duration(500)
            .attr("fill", colorMap[counter]);

        // Update the main text inside the rectangle
        mainText.text(counter);

        // Update the small rectangle labels with prefixes Q, K, V and the same counter
        textQ.text("Q" + counter);
        textK.text("K" + counter);
        textV.text("V" + counter);

        // Increment counter and reset if necessary
        counter = (counter % 20) + 1;
    }, 1000);
});
