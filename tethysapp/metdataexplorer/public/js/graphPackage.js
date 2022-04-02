let createGraph;
let data = [];
let graph;
let makeTrace;

createGraph = function () {
    const scatterOrBox = $("#graph-type-select").val();
    const graphDiv = document.getElementById("data-graph");
    const divWidth = $("#data-graph").width();
    const dataForGraph = ACTIVE_VARIABLES_PACKAGE.dataForGraph[scatterOrBox];
    let layout = {
        autosize: true,
        width: divWidth,
        margin: {
            t: 20,
            l: 20,
            r: 20,
            b: 20
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        plot_bgcolor: "#e0e0e0",
        paper_bgcolor: "#e0e0e0"
    };
    graph = Plotly.newPlot(graphDiv, dataForGraph, layout, {responsive: true});
};

makeTrace = function (yData, xData, title, variable) {
    const traceForScatter = {
        x: Object.values(xData),
        y: Object.values(yData),
        mode: 'lines',
        name: title,
        type: "scatter",
        variable: variable
    };
    ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter.push(traceForScatter);
    const traceForBox = {
        y: Object.values(yData),
        name: title,
        type: "box",
        variable: variable
    };
    ACTIVE_VARIABLES_PACKAGE.dataForGraph.box.push(traceForBox);
};

export {
    createGraph,
    data,
    makeTrace
};