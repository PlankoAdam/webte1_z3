
function graphInit() {
    graph.data = [];
    graph.data.push(['x', 'y1', 'y2'])
    graph.chart = new google.visualization.LineChart(document.getElementById('graph-chart'));
    graph.options = {
        title: 'graph',
        width: 1000,
        height: 500,
        curveType: 'function',
        colors: ['#12E351', '#097229']
    };

    graph.data.push([0,0,0]);
    onResize();
    graph.data.pop();

    evtSource.addEventListener('message', evtSource.fn = function(e) {
        let data = JSON.parse(e.data);
        updateGraph(Number(data.x), Number(data.y1), Number(data.y2));
    });
}

function updateGraph(x, y1, y2) {
    graph.data.push([x, y1, y2]);
    graph.chart.draw(google.visualization.arrayToDataTable(graph.data), graph.options);
}

function onResize() {
    graph.options.width = Math.min(mainConatiner.offsetWidth - 50, 1000);
    graph.chart.draw(google.visualization.arrayToDataTable(graph.data), graph.options);
}

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(graphInit);

let graph = {};

const evtSource = new EventSource("https://old.iolab.sk/evaluation/sse/sse.php");

const stopBtn = document.getElementById('stop-btn');
stopBtn.addEventListener('click', e => {
    evtSource.removeEventListener('message', evtSource.fn);
    stopBtn.innerHTML = 'Stopped';
    stopBtn.classList.add('disabled');
});

const mainConatiner = document.getElementById('main-container');
let resizeTimer;
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 5);
});