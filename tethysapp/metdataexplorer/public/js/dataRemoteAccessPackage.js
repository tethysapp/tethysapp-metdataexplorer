import {
    getFoldersAndFilesFromCatalogURL,
    getVariablesAndDimensionsForFileURL,
    getPermissionsFromServerURL,
    extractTimeseriesURL, formatParametersForGridsURL
} from "./urlsPackage.js";

let extractTimeseriesAjax;
let formatNotebookWithTimeseriesAjax;
let getFilesAndFoldersFromCatalogAjax;
let getDimensionsAndVariablesForFileAjax;
let hasPermissionToAddAndDeleteAjax;

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

export {
    extractTimeseriesAjax,
    formatNotebookWithTimeseriesAjax,
    getFilesAndFoldersFromCatalogAjax,
    getDimensionsAndVariablesForFileAjax,
    hasPermissionToAddAndDeleteAjax
};