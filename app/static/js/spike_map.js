import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const boroughPins = {

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
  return moneyFormat(v);
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
  await render();
  document.getElementById("spike_metric").addEventListener("change", render);
  document.getElementById("spike_year").addEventListener("change",   render);
}

async function render() {
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

function render(metric) {
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
        byBorough.set(d.borough, data1);
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
    cont.insertBefore(error, svg_wrap);
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

}