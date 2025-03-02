document.addEventListener("DOMContentLoaded", function () {
    // Select the container div and set its position to relative
    const container = d3.select("#attention-matrix-container")
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

    // Define new dimensions and positions (scaled by 1.5)
    // Q rectangle: originally x=30, y=30, width=10, height=30 -> now: width=15, height=45
    const qX = 30, qY = 30, qWidth = 15, qHeight = 45;
    // K rectangle: originally x=65, y=30, width=30, height=10 -> now: width=45, height=15, x shifted to 75 for more gap
    const kX = 75, kY = 30, kWidth = 45, kHeight = 15;
    // A rectangle: originally x=130, y=30, width=20, height=20 -> now: width=30, height=30, x shifted to 150 for more gap
    const aX = 150, aY = 30, aWidth = 30, aHeight = 30;

    // Draw Q rectangle (lightblue)
    svg.append("rect")
        .attr("x", qX)
        .attr("y", qY)
        .attr("width", qWidth)
        .attr("height", qHeight)
        .attr("fill", "lightblue");

    // Draw K rectangle (pink)
    svg.append("rect")
        .attr("x", kX)
        .attr("y", kY)
        .attr("width", kWidth)
        .attr("height", kHeight)
        .attr("fill", "pink");

    // Draw A rectangle (Aquamarine)
    svg.append("rect")
        .attr("x", aX + 10)
        .attr("y", aY)
        .attr("width", qWidth)
        .attr("height", qWidth)
        .attr("fill", "Aquamarine")
        .attr("opacity", 0.5);

    // Place a multiplication (dot product) symbol between Q and K
    svg.append("text")
        .attr("x", 60)
        .attr("y", qY + qHeight / 3.6)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .text("×");

    // Place an equality symbol between K and A
    svg.append("text")
        .attr("x", 135)
        .attr("y", kY + kHeight / 1.5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .text("=");

    // Static text inside the Q rectangle: "Q0"
    const qText = svg.append("text")
        .attr("x", qX + qWidth / 2)
        .attr("y", qY + qHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text("Q0");

    // Dynamic text inside the K rectangle (starts as "K0")
    const kText = svg.append("text")
        .attr("x", kX + kWidth / 2)
        .attr("y", kY + kHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text("K0");

    // Dynamic text inside the A rectangle (starts as "A(0,0)")
    const aText = svg.append("text")
        .attr("x", aX + aWidth / 2)
        .attr("y", aY + aHeight / 3.6)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "DarkBlue")
        .text("A(0,0)");

    // Initialize counters for i and k (both start at 0)
    let iCounter = 0;
    let kCounter = 0;

    // Update the texts every second indefinitely.
    // kCounter increments each tick; when it goes past 20, it resets to 0 and iCounter increments.
    // When iCounter goes past 20, it resets to 0.
    d3.interval(function () {
        // Update the K text (K0, K1, ..., K20)
        kText.text("K" + kCounter);
        // Update the A text (A(i,k) with i and k updated)
        aText.text("A(" + iCounter + "," + kCounter + ")");
        // Update the Q text (if desired, cycling similarly)
        qText.text("Q" + iCounter);

        // Increment kCounter and reset if necessary
        kCounter++;
        if (kCounter > 19) {
            kCounter = 0;
            iCounter++;
            if (iCounter > 19) {
                iCounter = 0;
            }
        }
    }, 1000); // Runs every 1000 ms indefinitely
});
