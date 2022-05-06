import {formatValuesFromGrids} from "./auxilaryPackage.js";
import {formatNotebookWithTimeseriesAjax} from "./dataRemoteAccessPackage.js";
import {notifyOfDanger, notifyOfInfo} from "./userMessagingPackage.js";

let formatCSV;
let formatHTML;
let formatJSON;
let formatPython;

formatCSV = function (dataOnGraph) {
    let previousVariable = "";
    let header = [];
    let longestArray = 0;

    dataOnGraph.forEach((traceArray) => {
        if (traceArray.variable !== previousVariable) {
            header.push([`datatime-${traceArray.name}`, ...traceArray.x]);
        }
        header.push([traceArray.name, ...traceArray.y]);
        previousVariable = traceArray.variable;
    });

    header.forEach((row) => {
        if (row.length > longestArray) {
            longestArray = row.length;
        }
    });

    header.forEach((row, index) => {
        if (row.length < longestArray) {
            header[index] = [...row, ...Array(longestArray - row.length).fill("")];
        }
    });

    const csvData = header[0].map((element, column) => {
        return header.map((element2, row) => {
            return header[row][column];
        })
    });

    return csvData.map((row) => {return row.join(",");}).join("\r\n");
};

formatHTML = function () {
    try {
        const currentGroupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
        const currentFileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
        const wmsURL = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].accessURLs.WMS;
        const variable = document.getElementById("variables-select").value;
        const min = document.getElementById("wms-bound-min").value;
        const max = document.getElementById("wms-bound-max").value;
        const layerStyle = document.getElementById("wmslayer-style").value;
        const dimensions = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].variables[variable].dimensions;
        const opacity = document.getElementById("opacity-slider").value;
        let additionalDimensionArray = {};

        dimensions.forEach((dimension) => {
            const dimensionType = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].dimensions[dimension].dimensionType;
            if (dimensionType === "other") {
                additionalDimensionArray[dimension] = $(`#dimension-additional-${dimension}-select-values`).val();
            }
        });

        const htmlFile = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>WMS MAP</title>
            
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.control.min.css"/>
            
                <style>
                    body {width: 100vw; height: 100vh; padding: 0; margin: 0;}
                    #map {width: 100%; height: 100%;}
                </style>
            
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js" crossorigin="anonymous"></script>
                <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/iso8601-js-period@0.2.1/iso8601.min.js" crossorigin="anonymous"></script>
                <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.min.js" crossorigin="anonymous"></script>
            </head>
                <body>
                    <div id="map"></div>
                </body>
            <script>
                let changeWMSLayerOpacity;
                let createWMSLayer;
                let initBaseMaps;
                let initMap;
                let mapObj;
                let setUpMap;
                let wmsTimeDimensionLayer;
            
                const additionalDimension = ${additionalDimensionArray[Object.keys(additionalDimensionArray)[0]]};
                const variable = "${variable}";
                const layerStyle = "${layerStyle}";
                const wmsURL = "${wmsURL}";
                const range = "${min},${max}";
            
                changeWMSLayerOpacity = function (opacity) {
                    if (mapObj.hasLayer(wmsTimeDimensionLayer)) {
                        wmsTimeDimensionLayer.setOpacity(opacity);
                    } else {
                        notifyOfDanger("Can't set opacity");
                    }
                }
            
                createWMSLayer = function () {
                    let wmsLayer;
            
                    try {
                        wmsLayer = L.tileLayer.wms(wmsURL, {
                            BGCOLOR: "0x000000",
                            colorscalerange: range,
                            crossOrigin: true,
                            dimension: "time",
                            elevation: additionalDimension,
                            format: "image/png",
                            layers: variable,
                            pane: "wmsLayer",
                            styles: layerStyle,
                            transparent: true,
                            useCache: true
                        });
            
                        wmsTimeDimensionLayer = L.timeDimension.layer.wms(wmsLayer, {
                            cacheForward: 200,
                            name: "timeDimensionLayer",
                            requestTimefromCapabilities: false,
                            updateTimeDimension: true,
                            updateTimeDimensionMode: "replace"
                        });
            
                        wmsTimeDimensionLayer.addTo(mapObj);
                    } catch (err) {
                        console.error(err);
                    }
                };
            
                initBaseMaps = function () {
                    const basemapLayers = {
                        "Esri Arial Imagery": L.tileLayer(
                            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                            {attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"}).addTo(mapObj),
                        "USGS Arial Imagery": L.tileLayer(
                            "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
                            {attribution: "Tiles courtesy of the <a href='https://usgs.gov/'>U.S. Geological Survey</a>"}),
                        "USGS Imagery With Labels": L.tileLayer(
                            "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}",
                            {attribution: "Tiles courtesy of the <a href='https://usgs.gov/'>U.S. Geological Survey</a>"}),
                        "USGS Topographical": L.tileLayer(
                            "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
                            {attribution: "Tiles courtesy of the <a href='https://usgs.gov/'>U.S. Geological Survey</a>"})
                    };
                    L.control.layers(basemapLayers, null, {collapsed: true}).addTo(mapObj);
                };
            
                initMap = function () {
                    mapObj = L.map("map", {
                        boxZoom: true,
                        center: [0, 0],
                        fullscreenControl: true,
                        minZoom: 2,
                        timeDimension: true,
                        timeDimensionControl: true,
                        timeDimensionControlOptions: {
                            autoPlay: true,
                            backwardButton: true,
                            forwardButton: true,
                            loopButton: true,
                            maxSpeed: 6,
                            minSpeed: 2,
                            position: "bottomleft",
                            speedStep: 1,
                            timeSliderDragUpdate: true
                        },
                        zoom: 3,
                        zoomSnap: 0.5
                    });
            
                    mapObj.createPane("wmsLayer");
                    mapObj.getPane("wmsLayer").style.zIndex = 250;
                    return mapObj;
                };
            
                setUpMap = function (callback) {
                    initMap();
                    initBaseMaps();
                    createWMSLayer();
                    if (typeof callback === "function") {
                        callback();
                    }
                };
            
                function ready(readyListener) {
                    if (document.readyState !== "loading") {
                        readyListener();
                    } else {
                        document.addEventListener("DOMContentLoaded", readyListener);
                    }
                };
            
                ready(function () {
                    setUpMap(() => {
                        console.log("Map Created");
                    });
                    changeWMSLayerOpacity(${opacity});
                });
            </script>
            </html>`;
        return htmlFile;
    } catch (error) {
        notifyOfDanger("Please make sure a file is selected");
        console.error(error);
    }
};

formatJSON = function (dataOnGraph) {
    let previousVariable = "";
    let jsonFromGraph = {};
    dataOnGraph.forEach((traceArray) => {
        if (traceArray.variable !== previousVariable) {
            jsonFromGraph[`datatime-${traceArray.name}`] = traceArray.x;
        }
        jsonFromGraph[traceArray.name] = traceArray.y;
        previousVariable = traceArray.variable;
    });
    return JSON.stringify(jsonFromGraph, null, 2);
};

formatPython = async function () {
    notifyOfInfo("Downloading the file.");
    const valuesForGrids = formatValuesFromGrids();
    const result = await formatNotebookWithTimeseriesAjax(valuesForGrids);

    if (result.errorMessage !== undefined) {
        notifyOfDanger(result.errorMessage);
        console.error(result.error);
        return false;
    } else {
        const gridsInitializer = result.gridsInitializer;
        const timeSeries = result.timeSeries;

        const pythonNotebookString = `{
  "nbformat": 4,
  "nbformat_minor": 0,
  "metadata": {
    "colab": {
      "name": "NotebookGeneratedByMDE.ipynb",
      "provenance": []
    },
    "kernelspec": {
      "name": "python3",
      "display_name": "Python 3"
    },
    "language_info": {
      "name": "python"
    }
  },
  "cells": [
    {
      "cell_type": "markdown",
      "source": [
        "# PYTHON GRIDS\\n",
        "## A python notebook for extracting a time series using grids."
      ],
      "metadata": {
        "id": "7lGzLhlf1pUf"
      }
    },
    {
      "cell_type": "markdown",
      "source": [
        "Install and import the grids python package."
      ],
      "metadata": {
        "id": "CI1BWmO_2AFk"
      }
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {
        "id": "LfujtBrdDBDj"
      },
      "outputs": [],
      "source": [
        "! python -m pip install grids\\n",
        "import grids\\n",
        "import matplotlib.pyplot as plt"
      ]
    },
    {
      "cell_type": "markdown",
      "source": [
        "Extract a time series for ${valuesForGrids.variable}"
      ],
      "metadata": {
        "id": "caL4GCR20KFR"
      }
    },
    {
      "cell_type": "code",
      "source": [
        "${gridsInitializer}\\n",
        "${timeSeries}\\n",
        "time_series"
      ],
      "metadata": {
        "id": "RgMxEzvnDc24"
      },
      "execution_count": null,
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "source": [
        "Fromat the timestamps as datetime values. Collect the column names."
      ],
      "metadata": {
        "id": "OmmiwiIT53uo"
      }
    },
    {
      "cell_type": "code",
      "source": [
        "new_datetime = []\\n",
        "column_names = []\\n",
        "\\n",
        "for timestamp in time_series['datetime']:\\n",
        "    new_datetime.append(timestamp.to_pydatetime())\\n",
        "\\n",
        "time_series[\\"datetime\\"] = new_datetime\\n",
        "\\n",
        "for column_name in time_series:\\n",
        "    if column_name != \\"datetime\\":\\n",
        "        column_names.append(column_name)"
      ],
      "metadata": {
        "id": "oEZxie--808O"
      },
      "execution_count": null,
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "source": [
        "Plot the time series."
      ],
      "metadata": {
        "id": "V-OsGamn2j38"
      }
    },
    {
      "cell_type": "code",
      "source": [
        "plt.rcParams[\\"figure.figsize\\"] = (20,10)\\n",
        "plt.plot(time_series['datetime'], time_series.iloc[:,1:])\\n",
        "plt.legend(column_names, loc='upper left')"
      ],
      "metadata": {
        "id": "9bCHn4hM4Kjj"
      },
      "execution_count": null,
      "outputs": []
    }
  ]
}`;
        return pythonNotebookString;
    }
};

export {
    formatCSV,
    formatHTML,
    formatJSON,
    formatPython
}