export function createScatterPlot(chartElement) {

    fetch('/data/neuropixel_probe_locs.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
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
                const d = data[index];
                const imageSrc = `/brainwide-neuropixels-vis/${encodeURIComponent(d.image_filename)}`;
                //console.log('Image source:', imageSrc); // Log the image source for debugging
                //console.log(data);
                //console.log(data[d]);
                const imageBlob = await fetch(imageSrc).then((response) => response.blob());
                const imageUrl = URL.createObjectURL(imageBlob);
                updateImage(imageUrl);
            });

            const imageSvg = d3
                .select(chartElement)
                .append('svg')
                .attr('width', imageWidth)
                .attr('height', imageHeight)
                .style('position', 'absolute')
                .style('left', `${width - imageWidth}`)
                .style('top', `${height / 2 - imageHeight / 6}`)
                .attr('class', 'image-container');

            const imageElement = imageSvg
                .append('image')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', '80%')
                .attr('height', '80%');

            const updateImage = (src) => {
                imageElement.attr('xlink:href', src);
            };
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
}
