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

function formatDataForColumnChart(dataObj) {
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

const jsonData = xml2json(loadXml('z03.xml'));

google.charts.load('current', {'packages':['bar']});
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

let chartWidth = 900;

function drawChart() {
    let data = google.visualization.arrayToDataTable(formatDataForColumnChart(jsonData));

    let options = {
        title: "Studijne vysledky",
        width: chartWidth,
        height: 400,
        colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000']
    };

    let chart = new google.charts.Bar(document.getElementById('col-chart-div'));

    chart.draw(data, google.charts.Bar.convertOptions(options));

    formatDataForPieChart(jsonData).forEach(element => {
        let data = google.visualization.arrayToDataTable(element.pieChartData);
        let options = {
            title: element.year,
            width: chartWidth/3,
            height: 300,
            colors: ['#12E351', '#0FBD44', '#0C9736', '#097229', '#064C1B', '#03260E', '#000000']
        }
        let newDiv = document.createElement('div', {id: 'pie-chart-div-'+element.year});
        let chart = new google.visualization.PieChart(newDiv);
        document.getElementById('pie-charts-div').append(newDiv);

        chart.draw(data, options);
    });
}