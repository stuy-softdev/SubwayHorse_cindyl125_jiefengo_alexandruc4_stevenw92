import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

