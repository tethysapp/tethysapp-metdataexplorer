////GLOBAL VARIABLES
//main.js
let firstlayeradded = false;
let shpfileAdded = false;
let URLpath = [];
let subsetURL = "";
let wmsURL = "";
let opendapURL = "";
let containerAttributes = false;
//timeseries.js
let chartdata = {};
//databases.js
let editing = false;
let geojsonName = 'No spatial reference';
let urlInfoBox = false;
let editDatabase = false;
//Included with draw.js: drawnItems, shpLayer
//Included with map.js: mapObj, insetMapObj, basemapObj, layerControlObj

function updateFilepath() {
    $("#loading-model").modal("show");
    if ($(this).attr("class") == "folder") {
        let newURL = $(this).attr("data-url");
        $("#url-input").val(newURL);
        getFoldersAndFiles(newURL);
    } else if ($(this).attr("class") == "file") {
        $('#name-in-form').attr('data-type', 'file');
        $("#url-input").val($(this).text().slice($(this).text().indexOf('') + 2));
        $("#layer-display-container").css("display", "inline");
        $("#filetree-div").css("display", "none");
        $("#file-info-div").css("display", "flex");
        opendapURL = $(this).attr("data-opendap-url");
        subsetURL = $(this).attr("data-subset-url");
        wmsURL = $(this).attr("data-wms-url");
        if (wmsURL.indexOf("http://") != -1) {
            console.log("Http endpoint found, changing to proxy URL");
            wmsURL = `${URL_threddsProxy}?main_url=${encodeURIComponent(wmsURL)}`;
            console.log(wmsURL);
        }
        if (containerAttributes === false) {
            let variablesAndFileMetadata = getVariablesAndFileMetadata();
            addVariables(variablesAndFileMetadata[0]);
            addFileMetadata(variablesAndFileMetadata[1]);
            let dimensionsAndVariableMetadata = getDimensionsAndVariableMetadata();
            addVariableMetadata(dimensionsAndVariableMetadata[1]);
            addDimensions(dimensionsAndVariableMetadata[0]);
        } else {
            addContainerAttributesToUserInputItems();
        }
        updateWMSLayer();
    }
    $("#loading-model").modal("hide");
}

function addVariables(variables) {
    let html = "";
    for (let i = 0; i < variables.length; i++) {
        html += `<option>${variables[i]}</option>`;
    }
    $("#variable-input").empty().append(html);
}

function addDimensions(dimensions) {
    let html = "";
    for (var i = 0; i < dimensions.length; i++) {
        html += `<option>${dimensions[i]}</option>`;
    }
    $("#time").empty().append(html);
    $("#time option:contains('time')").attr('selected', 'selected');
}

function addVariableMetadata(variableMetadata) {
    console.log(variableMetadata)
    $("#var-metadata-div").empty().append(variableMetadata);
}

function addFileMetadata(fileMetadata) {
    $('#metadata-div').attr('data-description', fileMetadata);
    $('#metadata-div').empty().append(fileMetadata);
    $('#file-metadata-button').css("background-color", "#1600F0");
}

function updateWMSLayer() {
    if (firstlayeradded == true) {
        layerControlObj.removeLayer(dataLayerObj);
        mapObj.removeLayer(dataLayerObj);
    }
    dataLayerObj = data_layer();
    dataLayerObj.setOpacity($("#opacity-slider").val());
    layerControlObj.addOverlay(dataLayerObj, "Data Layer");
}

function removeWMSLayer() {
    layerControlObj.removeLayer(dataLayerObj);
    mapObj.removeLayer(dataLayerObj);
    firstlayeradded = false;
    $("#layer-display-container").css("display", "none");
}

/////////////////////Retrieve file data//////////////////////////////
function getVariablesAndFileMetadata() {
    //$("#loading-model").modal("show");
    let variables = {};
    let fileMetadata = '';
    $.ajax({
        url: URL_getVariablesAndFileMetadata,
        data: {opendapURL: opendapURL},
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        async: false,
        success: function (result) {
            variables = result["variables_sorted"];
            fileMetadata = result["file_metadata"];
        }
    })
    return [variables, fileMetadata];
}

function getDimensionsAndVariableMetadata() {
    var dimensions = [];
    var variableMetadata = {};
    let variable = $("#variable-input").val();
    $.ajax({
        url: URL_getDimensionsAndVariableMetadata,
        data: {
            variable: variable,
            opendapURL: opendapURL
        },
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        async: false,
        success: function (result) {
            dimensions = result["dimensions"];
            variableMetadata = result["variable_metadata"];
        }
    })
    return [dimensions, variableMetadata];
}

function getFoldersAndFiles(url) {
    $('#name-in-form').attr('data-type', 'folder');
    $.ajax({
        url: URL_getFilesAndFolders,
        data: {'url': url},
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        success: function (result) {
            var dataTree = result["dataTree"];
            if (dataTree == "Invalid URL") {
                alert(dataTree);
            } else {
                $("#filetree-div").css("display", "block");
                $("#file-info-div").css("display", "none");
                var correctURL = result["correct_url"];
                let html = ""
                for (var file in dataTree["files"]) {
                    html += `<div data-wms-url="${dataTree["files"][file]["WMS"]}" 
                            data-subset-url="${dataTree["files"][file]["NetcdfSubset"]}" 
                            data-opendap-url="${dataTree["files"][file]["OPENDAP"]}" 
                            class="file" onclick="updateFilepath.call(this)">
                            <p class="far" style="display: inline-block">&#xf1c5; ${file}</p></div>`;
                }
                for (var folder in dataTree["folders"]) {
                    html += `<div data-url="${dataTree["folders"][folder]}" class="folder" 
                             onclick="updateFilepath.call(this)">
                             <p class="fas" style="display: inline-block">&#xf07b; ${folder}</p></div>`;
                }
                $("#filetree-div").empty().append(html);
                $("#url-input").val(correctURL);
                if (URLpath[URLpath.length - 1] !== correctURL) {
                    URLpath.push(correctURL);
                }
            }
            $("#loading-model").modal("hide");
        }
    })
}

