// Steven Wu, Alexandru Cimpoiesu, Jiefeng Ou, Cindy Liu
// SubwayHorse
// SoftDev
// P04: Makers Makin' It, Act II - The Seequel
// 04/22/2026

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const boroughPins = {
  "Bronx":         {x: 0.610, y: 0.250},
  "Manhattan":     {x: 0.468, y: 0.435},
  "Queens":        {x: 0.758, y: 0.415},
  "Brooklyn":      {x: 0.594, y: 0.645},
  "Staten Island": {x: 0.175, y: 0.768},

}

const imgSrc   = "/static/img/New_York_City_Council_Districts.svg";
const maxSpikeSize = 110;
const spikeWidth   = 20;

const metricLabel = {
  avg_base_salary : "Avg Base Salary",
  avg_gross_paid  : "Avg Gross Paid",
  avg_total_comp  : "Avg Total Compensation",
  headcount       : "Headcount",
  avg_ot_hours    : "Avg OT Hours",
};

const moneyFormat = d3.format("$,.0f");
const numFormat   = d3.format(",d");
const floatFormat = d3.format(",.1f");

function formatVal(metric, val) {
  if (val == null) {return "N/A";}
  if (metric === "headcount") {return numFormat(val);}
  if (metric === "avg_ot_hours") {return floatFormat(val) + " hrs";}
  return moneyFormat(val);
}

let allData = [];
async function init() {
  try {
    const years   = await fetch("/api/years").then(response => response.json());
    const yearElement = document.getElementById("spike_year");
    years.forEach(y => {
      const option = document.createElement("option");
      option.value = y; option.textContent = y;
      yearElement.appendChild(option);
    });
    if (years.length) yearElement.value = years[years.length -1];
  } catch(e) {console.warn("spike_years unavailable:", e);}
  await renderMap();
  document.getElementById("spike_metric").addEventListener("change", renderMap);
  document.getElementById("spike_year").addEventListener("change",   renderMap);
}

async function renderMap () {
  const year = document.getElementById("spike_year").value;
  const url  = "/api/map" + (year ? `?year=${encodeURIComponent(year)}` : "");
  const cont = document.getElementById("spike_map_container");
  cont.innerHTML = '<p class="text-center font-mono text-stone-400 py-8">Loading…</p>';
  try {
    allData = await fetch(url).then(response => response.json());
  } catch(e) {
    cont.innerHTML = '<p class="text-red-500 font-mono text-center py-4">Failed to load data.</p>';
    return;
  }
  render(document.getElementById("spike_metric").value);
}

function render (metric) {
  const cont = document.getElementById("spike_map_container");
  cont.innerHTML = "";
  cont.style.position = "relative";

  if (!allData.length) {
    cont.innerHTML = '<p class="text-stone-400 font-mono text-center py-8">No data for this selection.</p>';
    return;
  }
  const byBorough = new Map();
  for (const data1 of allData) {
    const prev = byBorough.get(data1.borough);
    const currentYear = data1.fiscal_year ?? 0;
    const prevYear = prev?.fiscal_year ?? 0;
    if (!prev || currentYear > prevYear) {
        byBorough.set(data1.borough, data1);
    }}
  const data     = Array.from(byBorough.values());
  const getValue = data2 => data2[metric] ?? 0;
  const maxVal   = d3.max(data, getValue) || 1;
  const minVal   = d3.min(data, getValue) || 0;

  const colorSpike = d3.scaleSequential(d3.interpolateYlOrRd).domain([minVal * 0.8, maxVal * 1.05]); // color!
  const heightScale = d3.scaleLinear().domain([0, maxVal]).range([0, maxSpikeSize]);

  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "NYC borough map";
  img.style.cssText = "display:block; width:100%; height:auto; border-radius:8px;";
  img.onerror =() => {
    img.style.display = "none";
    const error = document.createElement("p");
    error.className= "text-red-400 font-mono text-sm text-center py-2";
    error.textContent = "Map image not found";
    cont.insertBefore(error, svg_wrapper);
  };
  cont.appendChild(img);

  const svg_wrapper = document.createElement("div");
  svg_wrapper.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;";
  cont.appendChild(svg_wrapper);

  const svg = d3.select(svg_wrapper).append("svg")
    .attr("width",  "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 1000 1000")
    .attr("preserveAspectRatio", "none")
    .style("position", "absolute")
    .style("top", 0).style("left", 0);

  svg.style("pointer-events", "none");
  const tooltip = d3.select(cont).append("div")
    .style("position",       "absolute")
    .style("background",     "rgba(10,10,15,0.88)")
    .style("color",          "#f0f0f0")
    .style("padding",        "8px 14px")
    .style("border-radius",  "6px")
    .style("font-family",    "monospace")
    .style("font-size",      "12px")
    .style("line-height",    "1.65")
    .style("pointer-events", "none")
    .style("opacity",        0)
    .style("white-space",    "nowrap")
    .style("z-index",        20)
    .style("box-shadow",     "0 2px 8px rgba(0,0,0,0.4)");

  nycBoroughs.forEach(name => {
    const borough    = byBorough.get(name);
    const pin  = boroughPins[name];
    if (!borough || !pin) return;

    const changeX = pin.x * 1000;
    const changeY = pin.y * 1000;
    const height   = heightScale(getValue(borough)) * (1000 / 680);
    const spikeW  = spikeWidth * (1000 / 680);
    const col = colorSpike(getValue(borough));
    const spikePath = `M${changeX - spikeW/2},${changeY} L${changeX},${changeY - height} L${changeX + spikeW/2},${changeY} Z`; //makes spike
    svg.append("path")
      .attr("d", spikePath)
      .attr("fill", "transparent")
      .attr("stroke", "none")
      .style("pointer-events", "all")
      .style("cursor", "pointer")
      .on("mouseover", function(event) {
        spike.attr("opacity", 1).attr("stroke-width", 1.5).attr("stroke", "#000");
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(
          `<strong style="font-size:13px">${name}</strong><br>` +
          (borough.fiscal_year ? `<span style="color:#aaa">FY ${borough.fiscal_year}</span><br>` : "") +
          `${metricLabel[metric]}: <strong>${formatVal(metric, getValue(borough))}</strong><br>` +
          `Headcount: ${numFormat(borough.headcount ?? 0)}`
        );
      })
      .on("mousemove", function(event) {
        const rect = cont.getBoundingClientRect();
        tooltip.style("left", (event.clientX - rect.left + 14) + "px")
               .style("top",  (event.clientY - rect.top  - 20) + "px");
      })
      .on("mouseout", function() {
        spike.attr("opacity", 0.88).attr("stroke-width", 0.8).attr("stroke", "#222");
        tooltip.transition().duration(250).style("opacity", 0);
      });
    const spike = svg.append("path")
      .attr("d", spikePath)
      .attr("fill",         col)
      .attr("stroke",       "#222")
      .attr("stroke-width", 0.8)
      .attr("opacity",      0.88)
      .style("pointer-events", "none");
    svg.append("text")
      .attr("x", changeX)
      .attr("y", changeY - height - 6)
      .attr("text-anchor", "middle")
      .attr("font-size",   "28px")
      .attr("font-family", "monospace")
      .attr("fill",        "#111")
      .attr("font-weight", "600")
      .style("pointer-events", "none")
      .text(formatVal(metric, getValue(borough)));
  });

  const legendW = 280;
  const legendX = 1000 - legendW - 20;
  const legendY = 960;
  const gradId  = "spike-legend-grad-img";
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", gradId).attr("x1","0%").attr("x2","100%");
  d3.range(11).forEach(i => {
    grad.append("stop").attr("offset",`${i*10}%`).attr("stop-color", d3.interpolateYlOrRd(i/10));
  });
  const lg = svg.append("g").attr("transform", `translate(${legendX},${legendY})`);
  lg.append("rect").attr("y", 0).attr("width", legendW).attr("height", 18)
    .attr("fill", `url(#${gradId})`).attr("rx", 3);
  lg.append("text").attr("x", 0).attr("y", 36) .attr("font-size","22px").attr("font-family","monospace").attr("fill","#444")
    .text(formatVal(metric, minVal));
  lg.append("text").attr("x", legendW).attr("y", 36).attr("text-anchor","end")
    .attr("font-size","22px").attr("font-family","monospace").attr("fill","#444")
    .text(formatVal(metric, maxVal));
}
const nycBoroughs = ["Staten Island", "Brooklyn", "Queens", "Bronx", "Manhattan"];

init();
