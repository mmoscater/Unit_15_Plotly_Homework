function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  var metadataURL = "/metadata/"+sample;
  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
  d3.json(metadataURL).then(function(data) {
    console.log(data);
    
    var entryCount = Object.keys(data).length;
    // console.log(entryCount);
  
    // Use `.html("") to clear any existing metadata
    var metadata = d3.select("#sample-metadata");
    metadata.html('');
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    // metadiv = metadata.append('div').classed("container",true);
    var sampleTbl = metadata.append("table")
                      .attr("style","table-layout:fixed");
    var tbody = sampleTbl.append("tbody");
    var trow = tbody.append("tr");

    var smparea = metadata.append("div").classed("container",true)
    
    Object.entries(data).forEach(function([k,v]) {
      // row = smparea.append("div").classed("row",true)
      // row.append("div").classed("col-md-1",true).text(k)
      // row.append("div").classed("col-md-1",true).text(v)
      trow = tbody.append("tr");
      trow.append("td").text(k).attr("style","word-wrap:break-word");
      trow.append("td").text(v).attr("style","word-wrap:break-word");
      console.log(k)
      console.log(v)
    });
  
    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });
};

function buildCharts(sample) {
  var chartURL = "/samples/"+sample;
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(chartURL).then(function(sampleData) {
    // console.log(sampleData);
    // @TODO: Build a Bubble Chart using the sample data
    var otu_ids = sampleData.otu_ids;
    var sample_values = sampleData.sample_values;
    var otu_labels = sampleData.otu_labels;

      
    var trace = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        color: otu_ids,
        size: sample_values
      }
    };
    
    var data = [trace];
    
    var layout = {
      xaxis: {
        title: {
          text: 'OTU ID'}},
      showlegend: false
      // height: 600,
      // width: 600
    };
    
    // container = d3.select("#container");
    // newrow = container.append("div").classed("row",true);
    
    Plotly.newPlot('bubble', data,layout);
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var top10_otu = otu_ids.slice(0,10);
    var top10_samples = sample_values.slice(0,10);
    var top10_labels = otu_labels.slice(0,10);

    var top10_trace = {
    labels: top10_otu,
    values: top10_samples,
    hoverinfo: top10_labels,
    type: 'pie'
  };

    var data = [top10_trace];

    Plotly.newPlot("pie", data);

  });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function buildGauge(data){
  // Enter a speed between 0 and 180
var level = data;

// Trig to calc meter point
var degrees = 9 - level,
     radius = .5;
var radians = degrees * Math.PI / 9;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'washes',
    text: level,
    hoverinfo: 'text+name'},
  { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9,50/9, 50],
  rotation: 90,
  text: ['8-9', '7-8', '6-7', '5-6',
            '4-5', '3-4', '2-3','1-2','0-1'],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(41, 139, 25, .5)', 'rgba(68, 151, 50, .5)','rgba(95, 164, 75, .5)',
                         'rgba(123, 176, 101, .5)', 'rgba(150, 188, 126, .5)',
                         'rgba(177, 201, 151, .5)', 'rgba(204, 213, 176, .5)','rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)']},
  labels: ['8-9', '7-8', '6-7', '5-6',
  '4-5', '3-4', '2-3','1-2','0-1',''],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: '<b>Belly Button Washing Frequency</b> <br>Scrubs per Week',
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data, layout);
};

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
