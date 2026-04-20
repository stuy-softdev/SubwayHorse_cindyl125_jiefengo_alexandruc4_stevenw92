import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function load_chart(){
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Testing csv reading
    var payrollData;
    try {
        const response = await fetch("/static/data/unemployment.csv");
        const text = await response.text();
        payrollData = d3.csvParse(text);
        console.log("Data loaded:", payrollData);
    } catch (error) {
        console.error("Data not loaded:", error);
        return;
    }

    // select container
    const container = d3.select("#container");
    container.html("");

    const div = container.append("div").attr("class", "my-6 bg-white p-4 rounded shadow text-left");
    div.append("h2").text("Rate Distribution").attr("class", "text-xl font-bold mb-2 text-black");
    // Bin the data.
    const bins = d3.bin()
    .thresholds(40)
    .value((d) => +d.rate || 0)
    (payrollData);

    console.log("bins:");
    console.log(bins);

    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([marginLeft, width - marginRight]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])

    // Add a rect for each bin.
    svg.append("g")
    .attr("fill", "steelblue")
    .selectAll()
    .data(bins)
    .join("rect")
    .attr("x", (d) => x(d.x0) + 1)
    .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length));

    // Add the x-axis and label.
    svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x1));
    /*
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    .call((g) => g.append("text")
        .attr("x", width)
        .attr("y", marginBottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Unemployment rate (%) →"));
    */
    // Add the y-axis and label, and remove the domain line.
    svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y1));
    /*
    .call(d3.axisLeft(y).ticks(height / 40))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Frequency (no. of counties)"));
    */
    // Append the SVG element.
    div.append(() => svg.node());
}

load_chart()

