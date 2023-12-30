// Define the function to load and process data
const loadAndProcessData = async () => {
    const url = "https://raw.githubusercontent.com/mariakesa/mariakesa.github.io/main/allen-project/data/scores.json";
    const data = await d3.json(url);
    const scores = Object.values(data);
    const bins = d3.histogram().thresholds(30)(scores); // Use d3.histogram instead of d3.bin
    return bins;
};

// Define the function to set up parameters
const makeParameters = () => {
    const width = 600;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const barPadding = 1;
    const yAccessor = (d) => d.length;
    return { width, height, margin, barPadding, yAccessor };
};

// Define the function to make scales
const makeScales = (bins, margin, width, height) => {
    const xScale = d3
        .scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([margin.left, width - margin.right]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
};

// Define yGrid function
function yGrid(g, yScale, width, margin) {
    return g
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(""));
}

// Define the chart function
const chart = async () => {
    // Load and process the data
    const bins = await loadAndProcessData();

    // Make parameters
    const { width, height, margin, barPadding, yAccessor } = makeParameters();

    // Make scales
    const { xScale, yScale } = makeScales(bins, margin, width, height);

    // Create the chart and append it to the body
    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

    svg.append("g").call((g) => yGrid(g, yScale, width, margin)); // Pass yScale, width, and margin

    const text = svg
        .append("text")
        .attr("id", "toptext")
        .attr("x", width - 400)
        .attr("y", 80)
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-family", "sans-serif")
        .text("N neurons: 0");

    svg
        .append("g")
        .attr("fill", "lightblue")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", (d) => xScale(d.x0) + barPadding)
        .attr("y", (d) => yScale(d.length))
        .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
        .attr("height", (d) => yScale(0) - yScale(d.length))
        .on("mouseover", function (d, i) {
            console.log(i);
            d3.select(this).attr("style", "fill: orange;");
            d3.select("#toptext").text(`N neurons: ${i.length}`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("style", "outline: thin solid clear;");
            d3.select("#toptext").text("N neurons: 0");
        });

    svg.append("g").call(d3.axisBottom(xScale)); // Add x-axis
    svg.append("g").call(d3.axisLeft(yScale)); // Add y-axis

    return svg.node();
};

// Call the chart function
chart().then((chartNode) => document.body.appendChild(chartNode));
