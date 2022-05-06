import {notifyOfDanger, notifyOfInfo} from "./userMessagingPackage.js";
import {createGraph} from "./graphPackage.js";

let checkCsrfSafe;
let getCookie;
let hideLoadingModal;
let addDefaultBehaviorToAjax;
let formatValuesFromGrids;
let generateUniqueId;
let searchAndFilterATable;
let showLoadingModal;
let sizeWindows;

checkCsrfSafe = function (method) {
    // these HTTP methods do not require CSRF protection
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

getCookie = function (name) {
    let cookie;
    let cookies;
    let cookieValue = null;
    let i;

    if (document.cookie && document.cookie !== "") {
          cookies = document.cookie.split(";");
          for (i = 0; i < cookies.length; i += 1) {
                cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === name + "=") {
                      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                      break
                }
          }
    }
    return cookieValue;
};

hideLoadingModal = function (modalId) {
    $(`#loading-for-${modalId}`).hide();
    $(`#modal-body-for-${modalId}`).fadeIn();
};

addDefaultBehaviorToAjax = function () {
    // Add CSRF token to appropriate ajax requests
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!checkCsrfSafe(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
            }
        }
    });
};

formatValuesFromGrids = function() {
    try {
        const groupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
        const fileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
        const file = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId];
        const opendapURL = file.accessURLs.OPENDAP;
        const userCredentials = file.userCredentials;
        const variable = $("#variables-select").val();
        const dimensions = file.variables[variable].dimensions;
        let geojson;
        let geojsonType;
        let dimensionsAndValuesArray = {};
        let xDimension = false;
        let yDimension = false;

        dimensions.forEach((dimension) => {
            const dimensionType = file.dimensions[dimension].dimensionType;
            if (dimensionType === "other") {
                dimensionsAndValuesArray[dimension] = {
                    value: parseFloat($(`#dimension-additional-${dimension}-select-values`).val()),
                    dimensionType: "other"
                };
            } else if (dimensionType === "time") {
                if ($(`#dimension-time-${dimension}-first`).is(':disabled')) {
                    dimensionsAndValuesArray[dimension] = {
                        dimensionType: "time",
                        value: null
                    };
                } else {
                    dimensionsAndValuesArray[dimension] = {
                        dimensionType: "time",
                        firstValue: parseFloat($(`#dimension-time-${dimension}-first`).val()),
                        secondValue: parseFloat($(`#dimension-time-${dimension}-second`).val())
                    };
                }
            } else if (dimensionType === "x") {
                dimensionsAndValuesArray[dimension] = {
                    dimensionType: "x",
                    value: ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].dimensions[dimension].values
                };
                xDimension = true;
            } else if (dimensionType === "y") {
                dimensionsAndValuesArray[dimension] = {
                    dimensionType: "y",
                    value: ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].dimensions[dimension].values
                };
                yDimension = true;
            }

        });

        if (ACTIVE_VARIABLES_PACKAGE.geojson.shapefile) {
            geojson = ACTIVE_VARIABLES_PACKAGE.geojson.type;
            geojsonType = "shapefile";
        } else {
            geojson = ACTIVE_VARIABLES_PACKAGE.geojson.feature;
            geojsonType = ACTIVE_VARIABLES_PACKAGE.geojson.type;
        }

        if (Object.keys(ACTIVE_VARIABLES_PACKAGE.geojson.feature).length === 0 && xDimension && yDimension) {
            notifyOfInfo("Please define an area on the map over which to extract the data.");
        } else {
            const parametersForGrids = {
                dimensions: dimensions,
                dimensionsAndValues: JSON.stringify(dimensionsAndValuesArray),
                geojson: JSON.stringify(geojson),
                geojsonType: geojsonType,
                opendapURL: opendapURL,
                userCredentials: JSON.stringify(userCredentials),
                variable: variable
            };
            return parametersForGrids;
        }
    } catch (error) {
        notifyOfDanger("Please select data to download");
        console.error(error);
    }
}

generateUniqueId = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

searchAndFilterATable = function (idOfInputWithValueToSearch, idOfTableToSearch) {
    try {
        const valueToSearchFor = document.getElementById(`${idOfInputWithValueToSearch}`).value.toUpperCase();
        const tableToSearch = document.getElementById(`${idOfTableToSearch}`);
        const trElementsInTable = tableToSearch.getElementsByTagName("tr");

        for (const trElement of trElementsInTable) {
            const tdElement = trElement.getElementsByTagName("td");
            if (tdElement.length >= 1) {
                const textInTdElement = tdElement[1].textContent || tdElement[1].innerText;
                if (textInTdElement.toUpperCase().indexOf(valueToSearchFor) > -1) {
                    trElement.style.display = "";
                } else {
                    trElement.style.display = "none";
                }
            }
        }
    } catch (error) {
        notifyOfDanger('There was a problem preforming the search');
        console.error(error);
    }
};

showLoadingModal = function (modalId) {
    const height = $(`#modal-body-for-${modalId}`).outerHeight();
    $(`#loading-for-${modalId}`).height(height);
    $(`#modal-body-for-${modalId}`).hide();
    $(`#loading-for-${modalId}`).fadeIn();
};

sizeWindows = function () {
    const position = ($("#slider-bar").position().left * ($("#graph-map-btn").width() /
        ($("#graph-map-btn").width() - $("#slider-bar").width()))) /
        $("#graph-map-btn").width() * 100;
    $("#map").animate({height: `${position}%`}, {
        duration: 200,
        easing: "swing",
    });
    $("#graphs").animate({height: `${100 - position}%`}, {
        duration: 200,
        easing: "swing",
        complete: function () {
            createGraph();
        }
    });
};

export {
    addDefaultBehaviorToAjax,
    formatValuesFromGrids,
    generateUniqueId,
    hideLoadingModal,
    searchAndFilterATable,
    showLoadingModal,
    sizeWindows
};