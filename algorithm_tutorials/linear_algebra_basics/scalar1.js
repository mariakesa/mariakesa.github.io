// scalar.js

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    // Select the container div
    const container = d3.select("#scalar-container");

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
        .attr("class", "scalar-square");

    // Append text to display the scalar value
    const text = svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("class", "scalar-value")
        .text(scalarValue);

    // Create a container for the buttons
    const buttonsContainer = container.append("div")
        .attr("class", "buttons-container");

    // Append "Generate Random Integer" button
    const intButton = buttonsContainer.append("button")
        .attr("class", "random-button")
        .text("Generate Random Integer")
        .on("click", function () {
            // Generate a new random integer value
            scalarValue = getRandomInteger();
            // Update the text in the square
            updateText(scalarValue);
        });

    // Append "Generate Random Float" button
    const floatButton = buttonsContainer.append("button")
        .attr("class", "random-button")
        .text("Generate Random Float")
        .on("click", function () {
            // Generate a new random float value
            scalarValue = getRandomFloat();
            // Update the text in the square
            updateText(scalarValue.toFixed(2)); // Limit to 2 decimal places
        });

    // Function to generate a random integer value
    function getRandomInteger() {
        // Generate a random integer between -100 and 100
        return Math.floor(Math.random() * 201) - 100;
    }

    // Function to generate a random float value
    function getRandomFloat() {
        // Generate a random float between -100 and 100 with up to 2 decimal places
        return (Math.random() * 200 - 100);
    }

    // Function to update the text with transition
    function updateText(newValue) {
        text.transition()
            .duration(500)
            .tween("text", function() {
                const that = d3.select(this);
                const currentValue = parseFloat(that.text());
                const targetValue = parseFloat(newValue);
                const interpolator = d3.interpolateNumber(currentValue, targetValue);
                return function(t) {
                    // If the target is a float, show two decimals
                    if (Number.isInteger(targetValue)) {
                        that.text(Math.round(interpolator(t)));
                    } else {
                        that.text(interpolator(t).toFixed(2));
                    }
                };
            });
    }
});
