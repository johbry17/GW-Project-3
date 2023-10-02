let jsonData;

// use d3 to read in samples.json from "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"
source =
  "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";
d3.json(source).then(function (data) {
  // store data for use outside of d3
  jsonData = data;

  // populate dropdown menu
  data.names.forEach((name) => {
    d3.select("#selDataset").append("option").text(name);
  });

  // set default, which populates plots
  let choice = d3.select("select").node().value;
  optionChanged(choice);

  // Alternate version -
  // d3.select('#selDataset').property('value').dispatch('change');
});

// dynamically update all plots as new data is selected
function optionChanged(id) {
  // select data
  let bellyButton = jsonData.samples.find((sample) => sample.id === id);
  let meta = jsonData.metadata.find((sample) => sample.id === parseInt(id));

  // update plots
  barChart(bellyButton);
  bubbleChart(bellyButton);
  metaData(meta);
  washGauge(meta);
}

// create horizontal bar chart with dropdown menu to show top 10 OTUs
function barChart(bellyButton) {
  // slice off top Ten, reverse order for plotly
  // note that sample_values are already sorted in descending order
  let topTen = bellyButton.sample_values.slice(0, 10).reverse();
  let labels = bellyButton.otu_labels.slice(0, 10).reverse();

  // create trace
  let trace = {
    x: topTen,
    //.slice().reverse() to create a copy of the array and reverse it
    y: labels.map((label, index) => `OTU ${bellyButton.otu_ids[index]}`).slice().reverse(),
    text: labels,
    type: "bar",
    orientation: "h",
  };

  // create layout
  let layout = {
    title: {
      text: "<b>Top Ten OTU's</b>",
      font: {size: 24,},
    },
    xaxis: {title: "<b>Number of Samples Found</b>"},
  };

  // plot chart
  Plotly.newPlot("bar", [trace], layout);
}

// create bubble chart that displays all sample values
function bubbleChart(bellyButton) {
  // create trace
  let trace = {
    x: bellyButton.otu_ids,
    y: bellyButton.sample_values,
    text: bellyButton.otu_labels,
    mode: "markers",
    marker: {
      size: bellyButton.sample_values,
      color: bellyButton.otu_ids,
      colorscale: "Viridis",
    },
  };

  // set layout
  let layout = {
    title: {
      text: "<b>All OTU's</b>",
      font: {size: 24,},
    },
    xaxis: {title: `<b>OTU ID</b>`},
    yaxis: {title: `<b>Number of each OTU found</b>`},
  };

  //plot chart
  Plotly.newPlot("bubble", [trace], layout);
}

// display metadata (demographic data) - each key: value pair
function metaData(person) {
  // clear existing content
  d3.select("#sample-metadata").html("");

  // populate the table
  Object.keys(person).forEach((key) => {
    value = person[key];
    d3.select("#sample-metadata").append("p").html(`<b>${key}:</b> ${value}`);
  });
}

// optional: create belly button washing frequency gauge
function washGauge(thing) {
  // set colors for steps, inspired by Viridis for consistency with bubble chart
  let colors = [
    "#440154",
    "#482475",
    "#414487",
    "#355F8D",
    "#2A7F8E",
    "#21918C",
    "#25A979",
    "#3DCD60",
    "#85E96E",
  ];

  // define steps
  let steps = colors.map((color, i) => ({
    range: [i, i + 1],
    color: color,
  }));

  // define trace
  let trace = {
    value: thing.wfreq,
    type: "indicator",
    mode: "gauge+number",
    gauge: {
      axis: { range: [null, 9], tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      steps: steps,
      bar: { color: "orangered" },
    },
  };

  // set layout
  let layout = {
    title: {
      text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
      font: {
        size: 24,
      },
    },
  };

  // plot chart
  Plotly.newPlot("gauge", [trace], layout);
}
