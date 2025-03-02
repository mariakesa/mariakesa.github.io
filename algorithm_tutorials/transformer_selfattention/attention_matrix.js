document.addEventListener("DOMContentLoaded", function () {
    // Select the container div and set its position to relative
    const container = d3.select("#attention-matrix-container")
        .style("position", "relative")
        .style("width", "300px")
        .style("height", "100px"); // ensure container has defined dimensions

    // Append the SVG element positioned absolutely relative to the container
    const svg = container.append("svg")
        .attr("width", 300)
        .attr("height", 100)
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("pointer-events", "none")
        .style("opacity", 1);

    // Define dimensions and positions (adjusted):
    // Q rectangle now horizontal: width > height.
    const qX = 30, qY = 20, qWidth = 45, qHeight = 15;
    // K rectangle now vertical: height > width.
    const kX = 95, kY = 20, kWidth = 15, kHeight = 45;
    // A rectangle (result) remains a square.
    const aX = 130, aY = 40, aSize = 15;

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
        .attr("x", aX+10)
        .attr("y", aY-20)
        .attr("width", aSize)
        .attr("height", aSize)
        .attr("fill", "Aquamarine")
        .attr("opacity", 1.0);

    // Place a multiplication (dot product) symbol between Q and K.
    // Positioned roughly between Q's right edge and K's left edge.
    svg.append("text")
        .attr("x", 85)
        .attr("y", 27)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .text("×");

    // Place an equality symbol between K and A.
    svg.append("text")
        .attr("x", 120)
        .attr("y", 27)
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
        .attr("x", aX + aSize / 2+10)
        .attr("y", aY + aSize / 2-20)
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
    d3.interval(function () {
        // Update the K text (K0, K1, ..., K19)
        kText.text("K" + kCounter);
        // Update the A text (A(i,k))
        aText.text("A(" + iCounter + "," + kCounter + ")");
        // Update the Q text (Q0, Q1, ..., Q19)
        qText.text("Q" + iCounter);

        // Increment counters; reset appropriately.
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
