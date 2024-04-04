export function createScatterPlot(chartElement) {
    let updateImage; // Define updateImage function outside of the fetch callback
    let data; // Define data variable in a higher scope

    fetch('/data/neuropixel_probe_locs.json')
        .then(response => response.json())
        .then(dataResponse => {
            data = dataResponse; // Assign data from the fetch response to the higher scoped variable

            const width = 1000;
            const height = 600;
            const imageWidth = 600; // Fixed width for the image
            const imageHeight = 400; // Fixed height for the image

            const svg = d3.select(chartElement).append('svg').attr('width', width).attr('height', height);

            const xScale = d3
                .scaleLinear()
                .domain([-d3.max(data, (d) => d.x), d3.max(data, (d) => d.x)])
                .range([0, width - imageWidth]);

            const yScale = d3
                .scaleLinear()
                .domain([-d3.max(data, (d) => d.y), d3.max(data, (d) => d.y)])
                .range([height, 0]);

            const circles = svg
                .selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', (d) => xScale(d.x))
                .attr('cy', (d) => yScale(d.y))
                .attr('r', 3.5)
                .attr('fill', '#34ebb7')
                .attr('opacity', 0.5);

            circles.on('mouseover', async (event, index) => {
                const d = data[index]; // Retrieve the data point corresponding to the index
                const imageSrc = `/brainwide-neuropixels-vis/${encodeURIComponent(d.image_filename)}`;
                console.log('Image source:', imageSrc); // Log the image source for debugging
                const imageBlob = await fetch(imageSrc).then((response) => response.blob());
                const imageUrl = URL.createObjectURL(imageBlob);
                updateImage(imageUrl);
            });

            // Position the scatter plot and image side by side
            const scatterPlotLeft = 100; // Left position for the scatter plot
            const scatterPlotTop = 1000; // Top position for the scatter plot
            const imageLeft = width - imageWidth + scatterPlotLeft; // Left position for the image
            const imageTop = scatterPlotTop; // Top position for the image

            // Append the image container
            const imageSvg = d3
                .select(chartElement)
                .append('svg')
                .attr('width', imageWidth)
                .attr('height', imageHeight)
                .style('position', 'absolute')
                .style('left', `${imageLeft}px`)
                .style('top', `${imageTop}px`)
                .attr('class', 'image-container');

            const imageElement = imageSvg
                .append('image')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', '100%') // Adjust the width of the image to fill its container
                .attr('height', '100%'); // Adjust the height of the image to fill its container

            updateImage = (src) => { // Assign the function to updateImage variable
                imageElement.attr('xlink:href', src);
            };
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
}
