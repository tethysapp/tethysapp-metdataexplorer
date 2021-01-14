////GLOBAL VARIABLES
//main.js
let firstlayeradded = false;
let shpfileAdded = false;
let URLpath = [];
let subsetURL = "";
let wmsURL = "";
let opendapURL = "";
//timeseries.js
let chartdata = {};
//databases.js
let geojsonName = 'No spatial reference';
let urlInfoBox = false;
//Included with draw.js: drawnItems, shpLayer
//Included with map.js: mapObj, insetMapObj, basemapObj, layerControlObj

function update_wmslayer() {
    if (firstlayeradded == true) {
        layerControlObj.removeLayer(dataLayerObj);
        mapObj.removeLayer(dataLayerObj);
    }
    dataLayerObj = data_layer();
    dataLayerObj.setOpacity($("#opacity-slider").val());
    layerControlObj.addOverlay(dataLayerObj, "netcdf Layer");
}

function update_filepath() {
    if ($(this).attr("class") == "folder") {
        let newURL = $(this).attr("data-url");
        $("#url-input").val(newURL);
        get_files(newURL);
    } else if ($(this).attr("class") == "file") {
        $('#name-in-form').attr('data-type', 'file');
        console.log($(this).text().slice($(this).text().indexOf('') + 1))
        $("#url-input").val($(this).text().slice($(this).text().indexOf('') + 2));
        $("#layer-display-container").css("display", "inline");
        $("#filetree-div").css("display", "none");
        $("#file-info-div").css("display", "flex");
        wmsURL = $(this).attr("data-wms-url");
        if (wmsURL.indexOf("http://") != -1) {
            console.log("Http endpoint found, changing to proxy URL");
            wmsURL = `${URL_threddsProxy}?main_url=${encodeURIComponent(wmsURL)}`;
            console.log(wmsURL);
        }
        opendapURL = $(this).attr("data-opendap-url");
        subsetURL = $(this).attr("data-subset-url");
        get_metadata();
    }
}

function get_metadata() {
    $("#loading-model").modal("show");
    $.ajax({
        url: URL_metadata,
        data: {opendapURL: opendapURL},
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        success: function (result) {
            let variablesSorted = result["variables_sorted"];
            if (variablesSorted == false) {
                $("#loading-model").modal("hide");
                alert("Invalid file");
            } else {
                let attrs = result["attrs"];
                print_metadata(variablesSorted, attrs);
                getDimensions();
                update_wmslayer();
                $("#loading-model").modal("hide");
            }
        }
    })
}

function print_metadata(variablesSorted, attrs) {
    let html = "";
    let html2 = "";
    let description = '';
    for (let i = 0; i < variablesSorted.length; i++) {
        html += `<option>${variablesSorted[i]}</option>`;
    }
    $("#variable-input").empty().append(html);
    for (let att in attrs) {
        html2 += `<b style="padding-left: 40px">${att}:<b/><p style="padding-left: 40px">${attrs[att]}</p>`;
        description += `${att}: ${attrs[att]}
        `;
    }
    $('#metadata-div').attr('data-description', description);
    $('#metadata-div').empty().append(html2);
    $('#file-metadata-button').css("background-color", "#1600F0");
}

function getDimensions() {
    let variable = $("#variable-input").val();
    $.ajax({
        url: URL_getDimensions,
        data: {
            variable: variable,
            opendapURL: opendapURL
        },
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        success: function (result) {
            let dims = result["dims"];
            let variables = result["variables"];
            if (variables == false) {
                alert("Invalid THREDDS URL");
            } else {
                let html = "";
                for (var i = 0; i < dims.length; i++) {
                    html += `<option>${dims[i]}</option>`;
                }
                $("#time").empty().append(html);
                $("#time option:nth-child(3)").attr("selected", "selected");
                $("#lat").empty().append(html);
                $("#lat option:nth-child(1)").attr("selected", "selected");
                $("#lng").empty().append(html);
                $("#lng option:nth-child(2)").attr("selected", "selected");

                var html3 = `<b style="padding-left: 40px">${variable}:<b/>`;
                for (var attr in variables[variable]) {
                    html3 += `<p style="padding-left: 40px">${attr}: ${variables[variable][attr]}</p>`;
                }
                $("#var-metadata-div").empty().append(html3);
            }
        }
    })
}

function get_files(url) {
    $('#name-in-form').attr('data-type', 'folder');
    $.ajax({
        url: URL_buildDataTree,
        data: {url: url},
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        success: function (result) {
            var dataTree = result["dataTree"];
            if (dataTree == "Invalid URL") {
                alert(dataTree);
            } else {
                $("#layer-display-container").css("display", "none");
                $("#filetree-div").css("display", "block");
                $("#file-info-div").css("display", "none");
                var correctURL = result["correct_url"];
                let html = ""
                for (var file in dataTree["files"]) {
                    html += `<div data-wms-url="${dataTree["files"][file]["WMS"]}" 
                            data-subset-url="${dataTree["files"][file]["NetcdfSubset"]}" 
                            data-opendap-url="${dataTree["files"][file]["OPENDAP"]}" 
                            class="file" onclick="update_filepath.call(this)">
                            <p class="far" style="display: inline-block">&#xf1c5; ${file}</p></div>`;
                }
                for (var folder in dataTree["folders"]) {
                    html += `<div data-url="${dataTree["folders"][folder]}" class="folder" 
                             onclick="update_filepath.call(this)">
                             <p class="fas" style="display: inline-block">&#xf07b; ${folder}</p></div>`;
                }
                $("#filetree-div").empty().append(html);
                $("#url-input").val(correctURL);
                if (URLpath[URLpath.length - 1] !== correctURL) {
                    URLpath.push(correctURL);
                }
            }
        }
    })
}
