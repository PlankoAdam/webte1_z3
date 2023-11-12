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
google.charts.setOnLoadCallback(barChartInit);
google.charts.setOnLoadCallback(pieChartInit);

const jsonData = xml2json(loadXml('z03.xml'));

let barChart = {};

let pieCharts = [];

function barChartInit() {
    barChart.data = google.visualization.arrayToDataTable(formatDataForBarChart(jsonData));
    barChart.options = {
        title: "Studijne vysledky",
        colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000'],
    };

    barChart.chart = new google.charts.Bar(document.getElementById('bar-chart-div'));
    onResize();
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
    onResize();
}

const mainConatiner = document.getElementById('main-container');

function onResize() {
    
    barChart.options.width = Math.min(mainConatiner.offsetWidth - 50, 1000);

    if (bootstrapDetectBreakpoint().name === 'sm' || bootstrapDetectBreakpoint().name === 'xs') {
        barChart.options.bars = 'horizontal';
        barChart.options.height = 500;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width;
            element.options.height = 300;
        });
    }
    else if (bootstrapDetectBreakpoint().name === 'md') {
        barChart.options.bars = 'vertical';
        barChart.options.height = 400;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width/2;
            element.options.height = 200;
        });
    }
    else {
        barChart.options.bars = 'vertical';
        barChart.options.height = 400;
        pieCharts.forEach(element => {
            element.options.width = barChart.options.width/3;
            element.options.height = 200;
        });
    }

    barChart.chart.draw(barChart.data, google.charts.Bar.convertOptions(barChart.options));
    pieCharts.forEach(element => {
        element.chart.draw(element.data, element.options);
    });
};

let resizeTimer;
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 5);
});