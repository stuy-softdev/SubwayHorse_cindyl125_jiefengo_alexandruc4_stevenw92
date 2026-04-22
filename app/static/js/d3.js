// Steven Wu, Alexandru Cimpoiesu, Jiefeng Ou, Cindy Liu
// SubwayHorse
// SoftDev
// P04: Makers Makin' It, Act II - The Seequel
// 04/22/2026

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const loadingButton = document.getElementById("loading_button");
loadingButton.addEventListener("click", function() {
    load_chart()
});

async function load_chart(){
    // Declare the chart dimensions and margins.
    const width = 800;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Testing csv reading
    var payrollData;
    try {
        const x_axis = document.getElementById("x_axis").value;
        const y_axis = document.getElementById("y_axis").value;

        const response = await fetch(`/api?x_axis=${x_axis}&y_axis=${y_axis}`);
        const json = await response.json();
        console.log(json);

        payrollData = [];
        for(let i = 0; i < json.length; i++){
          var xData = json[i][0];
          var yData = json[i][1];
          if(x_axis == 'base_salary' || x_axis == 'total_other_pay' || x_axis == 'total_ot_paid' || x_axis == 'regular_gross_paid'){
            xData = +xData.replace(/[^0-9.-]+/g, "");
          }
          if(y_axis == 'base_salary' || y_axis == 'total_other_pay' || y_axis == 'total_ot_paid' || y_axis == 'regular_gross_paid'){
            yData = +yData.replace(/[^0-9.-]+/g, "");
          }
          payrollData.push({x_axis: xData, y_axis: yData})
        }
        console.log(payrollData);

    } catch (error) {
        console.error("Data not loaded:", error);
        return;
    }

    // select container
    const container = d3.select("#container");
    container.html("");

    const div = container.append("div").attr("class", "my-6 bg-white p-4 rounded shadow text-left");
    div.append("h2").text("Rate Distribution").attr("class", "text-xl font-bold mb-2 text-black");

    // // Bin the data.
    // const bins = d3.bin()
    // .thresholds(40)
    // .value((d) => +d.x_axis)
    // (payrollData);
    //
    // console.log("bins:");
    // console.log(bins);
    //
    // // Declare the x (horizontal position) scale.
    // const x = d3.scaleLinear()
    // .domain([bins[0].x0, bins[bins.length - 1].x1])
    // .range([marginLeft, width - marginRight]);
    //
    // // Declare the y (vertical position) scale.
    // const y = d3.scaleLinear()
    // .domain([0, d3.max(bins, (d) => d.length)])
    // .range([height - marginBottom, marginTop]);
    //
    // // Create the SVG container.
    // const svg = d3.create("svg")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("viewBox", [0, 0, width, height])
    //
    // // Add a rect for each bin.
    // svg.append("g")
    // .attr("fill", "steelblue")
    // .selectAll()
    // .data(bins)
    // .join("rect")
    // .attr("x", (d) => x(d.x0) + 1)
    // .attr("width", (d) => x(d.x1) - x(d.x0))
    // .attr("y", (d) => y(d.length))
    // .attr("height", (d) => y(0) - y(d.length));
    //
    // // Add the x-axis and label.
    // svg.append("g")
    // .attr("transform", `translate(0,${height - marginBottom})`)
    // .call(d3.axisBottom(x));
    // /*
    // .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    // .call((g) => g.append("text")
    //     .attr("x", width)
    //     .attr("y", marginBottom - 4)
    //     .attr("fill", "currentColor")
    //     .attr("text-anchor", "end")
    //     .text("Unemployment rate (%) →"));
    // */
    // // Add the y-axis and label, and remove the domain line.
    // svg.append("g")
    // .attr("transform", `translate(${marginLeft},0)`)
    // .call(d3.axisLeft(y));
    // /*
    // .call(d3.axisLeft(y).ticks(height / 40))
    // .call((g) => g.select(".domain").remove())
    // .call((g) => g.append("text")
    //     .attr("x", -marginLeft)
    //     .attr("y", 10)
    //     .attr("fill", "currentColor")
    //     .attr("text-anchor", "start")
    //     .text("↑ Frequency (no. of counties)"));
    // */
    // // Append the SVG element.
    // div.append(() => svg.node());


   // #######
   // GRAPH 2
   // #######

   // Declare the x (horizontal position) scale.
   const x = d3.scaleBand()
       .domain(d3.groupSort(payrollData, ([d]) => -d.y_axis, (d) => d.x_axis)) // descending frequency
       .range([marginLeft, width - marginRight])
       .padding(0.1);

   // Declare the y (vertical position) scale.
   const y = d3.scaleLinear()
       .domain([0, d3.max(payrollData, (d) => d.y_axis)])
       .range([height - marginBottom, marginTop]);

   // Create the SVG container.
   const svg = d3.create("svg")
       .attr("width", width)
       .attr("height", height)
       .attr("viewBox", [0, 0, width, height])
       .attr("style", "max-width: 100%; height: auto;");

   // Add a rect for each bar.
   svg.append("g")
       .attr("fill", "steelblue")
     .selectAll()
     .data(payrollData)
     .join("rect")
       .attr("x", (d) => x(d.x_axis))
       .attr("y", (d) => y(d.y_axis))
       .attr("height", (d) => y(0) - y(d.y_axis))
       .attr("width", x.bandwidth());

   // Add the x-axis and label.
   svg.append("g")
       .attr("transform", `translate(0,${height - marginBottom})`)
       .call(d3.axisBottom(x).tickSizeOuter(0));

   // Add the y-axis and label, and remove the domain line.
   svg.append("g")
       .attr("transform", `translate(${marginLeft},0)`)
       .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
       .call(g => g.select(".domain").remove())
       .call(g => g.append("text")
           .attr("x", -marginLeft)
           .attr("y", 10)
           .attr("fill", "currentColor")
           .attr("text-anchor", "start")
           .text("↑ Frequency (%)"));

   // Append the SVG element.
   div.append(() => svg.node());
}