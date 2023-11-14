let graph = {};
let amp = 1;
const defLineWidth = 5;

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(graphInit);

const evtSource = new EventSource(
  "https://old.iolab.sk/evaluation/sse/sse.php"
);

const stopBtn = document.getElementById("stop-btn");
stopBtn.addEventListener("click", () => {
  evtSource.removeEventListener("message", evtSource.fn);
  document.getElementById("stop-btn-txt").innerHTML = "Stopped";
  stopBtn.classList.add("disabled");
  graph.options.explorer = {};
  drawGraph();
  $("#graph-controls-tool-tip").css("opacity", 1);
});

const amplitudeSlider = document.getElementById("amplitude-slider");
amplitudeSlider.addEventListener("change", () => {
  updateAmp(amplitudeSlider.value);
  drawGraph();
});

const mainConatiner = document.getElementById("main-container");
let resizeTimer;
$(window).resize(function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(onResize, 5);
});

const sinCheckbox = document.getElementById("sin-checkbox");
sinCheckbox.addEventListener("change", () => {
  let lw;
  if (sinCheckbox.checked) lw = defLineWidth;
  else lw = 0;
  graph.options.series[0] = {
    lineWidth: lw,
  };
  drawGraph();
});

const cosinCheckbox = document.getElementById("cosin-checkbox");
cosinCheckbox.addEventListener("change", () => {
  let lw;
  if (cosinCheckbox.checked) lw = defLineWidth;
  else lw = 0;
  graph.options.series[1] = {
    lineWidth: lw,
  };
  drawGraph();
});

updateAmp(amplitudeSlider.value);

function graphInit() {
  graph.data = [];
  graph.chart = new google.visualization.LineChart(
    document.getElementById("graph-chart")
  );
  graph.options = {
    width: 1000,
    height: 500,
    curveType: "function",
    colors: ["#12E351", "#097229"],
    explorer: null,
    chartArea: {
      width: 800,
      height: 400,
    },
    series: {
      0: {
        lineWidth: defLineWidth,
      },
      1: {
        lineWidth: defLineWidth,
      },
    },
    legend: {
      position: "top",
      alignment: "center",
    },
  };

  graph.data.push([0, 0, 0]);
  onResize();
  graph.data.pop();

  evtSource.addEventListener(
    "message",
    (evtSource.fn = function (e) {
      let data = JSON.parse(e.data);
      updateGraph(Number(data.x), Number(data.y1), Number(data.y2));
    })
  );
}

function updateGraph(x, y1, y2) {
  graph.data.push([x, y1, y2]);
  drawGraph();
}

function onResize() {
  graph.options.width = Math.min(mainConatiner.offsetWidth - 50, 1000);
  graph.options.chartArea.width = graph.options.width * 0.85;
  drawGraph();
}

function drawGraph() {
  tableData = [];
  tableData.push(["x", "Sin", "Cosin"]);
  graph.data.forEach((e) => {
    tableData.push([e[0], amp * e[1], amp * e[2]]);
  });
  ampChanged = false;
  graph.chart.draw(
    google.visualization.arrayToDataTable(tableData),
    graph.options
  );
}

function updateAmp(newAmp) {
  amp = newAmp;
  ampChanged = true;
}
