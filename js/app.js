function loadXml(url) {
    let xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        return xmlhttp.responseXML;
    }
    else {
        console.log('Error loading XML');
    }
}

function xml2json(xml) {
    try {
      var obj = {};
      if (xml.children.length > 0) {
        for (var i = 0; i < xml.children.length; i++) {
          var item = xml.children.item(i);
          var nodeName = item.nodeName;
  
          if (typeof (obj[nodeName]) == "undefined") {
            obj[nodeName] = xml2json(item);
          } else {
            if (typeof (obj[nodeName].push) == "undefined") {
              var old = obj[nodeName];
  
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xml2json(item));
          }
        }
      } else {
        obj = xml.textContent;
      }
      return obj;
    } catch (e) {
        console.log(e.message);
    }
}

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

google.charts.load('current', {'packages':['bar']});
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawBarChart);
google.charts.setOnLoadCallback(drawPieCharts);

const jsonData = xml2json(loadXml('z03.xml'));

const barChartData = formatDataForBarChart(jsonData);
let barChart;
let barChartOptions;

const pieChartsData = formatDataForPieChart(jsonData);
let pieCharts = [];
let pieChartOptions = [];

function drawBarChart() {
    let data = google.visualization.arrayToDataTable(barChartData);

    barChartOptions = {
        title: "Studijne vysledky",
        width: 900,
        height: 300,
        colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000'],
    };

    barChart = new google.charts.Bar(document.getElementById('col-chart-div'));

    barChart.draw(data, google.charts.Bar.convertOptions(barChartOptions));
}

function drawPieCharts() {
    pieChartsData.forEach(element => {
        let data = google.visualization.arrayToDataTable(element.pieChartData);

        let options = {
            title: element.year,
            width: barChartOptions.width/3,
            height: 200,
            colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000'],
            legend: {alignment: 'center'}
        }
        pieChartOptions.push(options);

        let newDiv = document.createElement('div');
        document.getElementById('pie-charts-div').append(newDiv);

        let chart = new google.visualization.PieChart(newDiv);
        pieCharts.push(chart);

        chart.draw(data, options);
    });
}

const mainConatiner = document.getElementById('main-container');

function onResize() {
    if (bootstrapDetectBreakpoint().name === 'sm') {
        barChartOptions.bars = 'horizontal';
        barChartOptions.height = 500;
    }
    else if (bootstrapDetectBreakpoint().name === 'md') {
        barChartOptions.bars = 'vertical';
        barChartOptions.height = 300;
    }
    barChartOptions.width = mainConatiner.offsetWidth - 50;

    barChart.draw(google.visualization.arrayToDataTable(barChartData), google.charts.Bar.convertOptions(barChartOptions));
};

var resizeTimer;
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 5);
});

// onResize();