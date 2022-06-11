import {
    getFoldersAndFilesFromCatalogURL,
    getVariablesAndDimensionsForFileURL,
    getPermissionsFromServerURL,
    extractTimeseriesURL,
    formatParametersForGridsURL,
    updateDimensionsURL
} from "./urlsPackage.js";
import {notifyOfDanger} from "./userMessagingPackage.js";
import {addOptionsToSelect} from "./htmlPackage.js";

let extractTimeseriesAjax;
let formatNotebookWithTimeseriesAjax;
let getFilesAndFoldersFromCatalogAjax;
let getDimensionsAndVariablesForFileAjax;
let hasPermissionToAddAndDeleteAjax;
let updateDimensionsAjax;

extractTimeseriesAjax = async function (parametersForGrids) {
    const result = await $.ajax({
        data: parametersForGrids,
        dataType: 'json',
        type: 'POST',
        url: extractTimeseriesURL,
    });
    return result;
};

formatNotebookWithTimeseriesAjax = async function (parametersForGrids) {
    const result = await $.ajax({
        data: parametersForGrids,
        dataType: 'json',
        type: 'POST',
        url: formatParametersForGridsURL,
    });
    return result;
};

getFilesAndFoldersFromCatalogAjax = async function (urlForCatalog) {
    const result = await $.ajax({
        data: {urlForCatalog},
        dataType: 'json',
        type: 'POST',
        url: getFoldersAndFilesFromCatalogURL,
    });
    return result.data;
};

getDimensionsAndVariablesForFileAjax = async function (opendapURL) {
    const result = await $.ajax({
        data: {opendapURL},
        dataType: 'json',
        type: 'POST',
        url: getVariablesAndDimensionsForFileURL,
    });
    return result.data;
};

hasPermissionToAddAndDeleteAjax = async function () {
    const result = await $.ajax({
        type: "GET",
        url: getPermissionsFromServerURL,
    });
    return result;
};

updateDimensionsAjax = function (dimensions, opendapURL, currentFile) {
    const data = {
        dimensions: dimensions,
        url: opendapURL
    }
    $.ajax({
        data: data,
        type: "POST",
        url: updateDimensionsURL,
        success: function (data) {
            const result = data.data;
            if (result.errorMessage !== undefined) {
                console.error(result.error);
                notifyOfDanger(result.errorMessage);
            } else {
                Object.keys(result.updatedValues).forEach((key) => {
                    currentFile.dimensions[key].values = result.updatedValues[key];
                    addOptionsToSelect(dimensions, currentFile);
                });
            }
        }
    });
}

export {
    extractTimeseriesAjax,
    formatNotebookWithTimeseriesAjax,
    getFilesAndFoldersFromCatalogAjax,
    getDimensionsAndVariablesForFileAjax,
    hasPermissionToAddAndDeleteAjax,
    updateDimensionsAjax
};