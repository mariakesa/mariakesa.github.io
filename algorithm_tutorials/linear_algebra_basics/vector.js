function createRowVector(container) {
    squareSize = width/colors.length;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("x", (d, i) => i * (squareSize) + (width - (colors.length * squareSize)) / 2)
        .attr("y", (height - squareSize) / 2)
        .attr("fill", d => d)
        .attr("class", "vector-square");
}

document.addEventListener("DOMContentLoaded", function () {
    // Select the container div
    const container_row = d3.select("#vector-container-row");

    // Set dimensions for the SVG square
    const width = 50;
    const height = 50;

    colors=['black','pink','gray'];

    function createRowVector(container) {
        squareSize = width/colors.length;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("x", (d, i) => i * (squareSize))
            .attr("fill", d => d)
            .attr("class", "vector-square");
    }

    createRowVector(container_row);

    // Initialize the scalar value (integer by default)

    // Create an SVG element
    /*
    const svg_row = container_row.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Append a rectangle (square) to the SVG
    const square1_row = svg_row.append("rect")
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square");

    const square2_row=svg_row.append("rect")
        .attr("x", width/3)
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square")
        .attr("fill", "pink");

    const square3_row=svg_row.append("rect")
        .attr("x", 2*width/3)
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square")
        .attr("fill", "gray");
    */

    // Select the container div
    const container_column = d3.select("#vector-container-column");

    function createColumnVector(container) {
        squareSize = height/colors.length;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("y", (d, i) => i * (squareSize))
            .attr("fill", d => d)
            .attr("class", "vector-square");
    }

    createColumnVector(container_column);

    // Initialize the scalar value (integer by default)

    // Create an SVG element
    /*
    const svg_column = container_column.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Append a rectangle (square) to the SVG
    const square1_column = svg_column.append("rect")
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square");

    const square2_column=svg_column.append("rect")
        .attr("y", height/3)
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square")
        .attr("fill", "pink");

    const square3_column=svg_column.append("rect")
        .attr("y", 2*height/3)
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("class", "vector-square")
        .attr("fill", "gray");
    */
    const transpose_vec_container = d3.select("#transpose-vector");

    currently_row=true;

    createRowVector(transpose_vec_container);

    const buttonsContainer = d3.select("#transpose-buttons");

    // Append "Generate Random Integer" button
    const intButton = d3.select("#transpose-button")
        .on("click", function () {
            if (currently_row) {
                transpose_vec_container.select("svg").remove();
                createColumnVector(transpose_vec_container);
                currently_row = false;
            } else {
                transpose_vec_container.select("svg").remove();
                createRowVector(transpose_vec_container);
                currently_row = true;
            }
        });

    //scalarValue= "hello";
    //const text = svg.append("text")
        //.attr("x", width / 2)
        //.attr("y", height / 2)
        //.attr("class", "vector-value")
        //.text(scalarValue);

});