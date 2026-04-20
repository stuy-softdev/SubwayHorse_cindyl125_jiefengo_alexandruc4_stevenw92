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


   // #######
   // GRAPH 2
   // #######

    const div2 = container.append("div").attr("class", "my-6 bg-white p-4 rounded shadow text-left");
    div2.append("h2").text("Bar Graph").attr("class", "text-xl font-bold mb-2 text-black");

    const barData = payrollData.slice(0, 10); //take first 10 to test
    
    const x2 = d3.scaleBand()
        .domain(barData.map((d, i) => i))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(barData, d => +d.rate || 0)])
        .nice()
        .range([height - marginBottom, marginTop]);

    const svg2 = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    svg2.append("g")
        .attr("fill", "mediumseagreen")
        .selectAll()
        .data(barData)
        .join("rect")
        .attr("x", (d, i) => x2(i))
        .attr("y", d => y2(+d.rate || 0))
        .attr("height", d => y2(0) - y2(+d.rate || 0))
        .attr("width", x2.bandwidth());

    svg2.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x2).tickFormat(i => `Item ${i+1}`));
    svg2.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y2));

    div2.append(() => svg2.node());

    // #######
    // GRAPH 3
    // #######

    const div3 = container.append("div").attr("class", "my-6 bg-white p-4 rounded shadow text-left");
    div3.append("h2").text("Scatter)").attr("class", "text-xl font-bold mb-2 text-black");

    const scatterData = payrollData.slice(0, 50); // less clutter
    const x3 = d3.scaleLinear()
        .domain([0, scatterData.length])
        .range([marginLeft, width - marginRight]);
    
    const y3 = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => +d.rate || 0)])
        .nice()
        .range([height - marginBottom, marginTop]);

    const svg3 = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    svg3.append("g")
        .selectAll("circle")
        .data(scatterData)
        .join("circle")
        .attr("cx", (d, i) => x3(i))
        .attr("cy", d => y3(+d.rate || 0))
        .attr("r", 5)
        .attr("fill", "tomato")
        .attr("opacity", 0.7);

    svg3.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x3));
    svg3.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y3));

    div3.append(() => svg3.node());
}

load_chart()

