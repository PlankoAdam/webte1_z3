import * as utils from './utils.js';

google.charts.load('current', {'packages':['bar']});
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(chartsInit);

const jsonData = utils.xml2json(utils.loadXml('z03.xml'));

let barChart = {};

let pieCharts = [];

let steppedChart = {};

function formatDataForBarChart(dataObj) {
    const chartData = [];
    chartData.push(["Rok","A","B","C","D","E","FN","FX"]);
    dataObj.webte1.zaznam.slice().reverse().forEach(element => {
        chartData.push([
            element.rok,
            Number(element.hodnotenie.A),
            Number(element.hodnotenie.B),
            Number(element.hodnotenie.C),
            Number(element.hodnotenie.D),
            Number(element.hodnotenie.E),
            Number(element.hodnotenie.FN),
            Number(element.hodnotenie.FX),
        ]);
    });
    return chartData;
}

function formatDataForPieChart(dataObj) {
    const chartData = [];
    dataObj.webte1.zaznam.slice().reverse().forEach(element => {
        chartData.push({
            year: element.rok,
            pieChartData: [
                ['Grade', 'Count'],
                ['A', Number(element.hodnotenie.A)],
                ['B', Number(element.hodnotenie.B)],
                ['C', Number(element.hodnotenie.C)],
                ['D', Number(element.hodnotenie.D)],
                ['E', Number(element.hodnotenie.E)],
                ['FN', Number(element.hodnotenie.FN)],
                ['FX', Number(element.hodnotenie.FX)],
            ]
        });
    });
    return chartData;
}

function formatDataForSteppedChart(dataObj) {
    const chartData = [];
    chartData.push(['Rok','Absolventi','Prepadnutí']);
    dataObj.webte1.zaznam.slice().reverse().forEach(element => {
        const successCount =
            Number(element.hodnotenie.A) +
            Number(element.hodnotenie.B) +
            Number(element.hodnotenie.C) +
            Number(element.hodnotenie.D) +
            Number(element.hodnotenie.E);
        const failCount =
            Number(element.hodnotenie.FN) +
            Number(element.hodnotenie.FX);
        chartData.push([
            element.rok,
            successCount,
            failCount,
        ]);
    });
    return chartData;
}

function chartsInit() {
    barChartInit();
    pieChartInit();
    steppedChartInit();
    onResize();
}

function barChartInit() {
    barChart.data = google.visualization.arrayToDataTable(formatDataForBarChart(jsonData));
    barChart.options = {
        title: "Studijne vysledky",
        colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000'],
    };

    barChart.chart = new google.charts.Bar(document.getElementById('bar-chart-div'));
}

function pieChartInit() {
    formatDataForPieChart(jsonData).forEach(element => {
        let data = google.visualization.arrayToDataTable(element.pieChartData);

        let options = {
            title: element.year,
            colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000'],
            legend: {alignment: 'center'}
        }

        let newDiv = document.createElement('div');
        document.getElementById('pie-charts-div').append(newDiv);

        let chart = new google.visualization.PieChart(newDiv);
        pieCharts.push({
            data: data,
            options: options,
            chart: chart
        });
    });
}

function steppedChartInit() {
    steppedChart.data = google.visualization.arrayToDataTable(formatDataForSteppedChart(jsonData));
    steppedChart.options = {
        title: "Studijne vysledky",
        colors: ['#12E351', '#F02000'],
        isStacked: true,
        height: 700
    };

    steppedChart.chart = new google.visualization.SteppedAreaChart(document.getElementById('stepped-chart-div'));
}

const mainConatiner = document.getElementById('main-container');

function onResize() {
    
    barChart.options.width = Math.min(mainConatiner.offsetWidth - 50, 1000);
    steppedChart.options.width = barChart.options.width;

    if (bootstrapDetectBreakpoint().name === 'sm' || bootstrapDetectBreakpoint().name === 'xs') {
        barChart.options.bars = 'horizontal';
        barChart.options.height = 500;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width;
            element.options.height = 300;
        });
        steppedChart.options.height = 300;
    }
    else if (bootstrapDetectBreakpoint().name === 'md') {
        barChart.options.bars = 'vertical';
        barChart.options.height = 400;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width/2;
            element.options.height = 200;
        });
        steppedChart.options.height = 500;
    }
    else {
        barChart.options.bars = 'vertical';
        barChart.options.height = 400;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width/3;
            element.options.height = 200;
        });
        steppedChart.options.height = 700;
    }

    barChart.chart.draw(barChart.data, google.charts.Bar.convertOptions(barChart.options));
    pieCharts.forEach(element => {
        element.chart.draw(element.data, element.options);
    });
    steppedChart.chart.draw(steppedChart.data, steppedChart.options);
};

let resizeTimer;
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 5);
});