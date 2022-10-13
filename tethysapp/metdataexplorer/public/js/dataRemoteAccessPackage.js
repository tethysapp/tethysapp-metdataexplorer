import {
    getFoldersAndFilesFromCatalogURL,
    getVariablesAndDimensionsForFileURL,
    getPermissionsFromServerURL,
    extractTimeseriesURL,
    formatParametersForGridsURL,
    updateFileDataURL
} from "./urlsPackage.js";
import {notifyOfDanger} from "./userMessagingPackage.js";
import {
    addFileMetadata,
    addListOfVariablesToBaseMenu,
    buildBaseMenuForSelectedVariable,
    createOptionForSelect
} from "./htmlPackage.js";
import {sizeWindows} from "./auxilaryPackage.js";
import {createGraph} from "./graphPackage.js";

let extractTimeseriesAjax;
let formatNotebookWithTimeseriesAjax;
let getFilesAndFoldersFromCatalogAjax;
let getDimensionsAndVariablesForFileAjax;
let hasPermissionToAddAndDeleteAjax;
let updateAndBuildBaseMenu;
let updateFileDataAjax;

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

updateAndBuildBaseMenu = async function () {
    const groupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
    const fileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;

    const accessURLS = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].accessURLs;
    const fileType = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].fileType;
    const listOfVariables = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables;
    const dimensionalVariables = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].dimensionalVariables;

    const updatedFileDict = await updateFileDataAjax(accessURLS, fileType, listOfVariables, dimensionalVariables)

    ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId] = {...ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId], ...updatedFileDict}

    const fileMetadataHtml = addFileMetadata();
    const listOfVariablesHtml = addListOfVariablesToBaseMenu();
    let variableToSelect = "";

    $("#variables-select").empty();
    $("#additional-dimensions-div").empty();

    Object.keys(ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables).forEach((variable, index) => {
        let value = variable;
        if (ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables[variable].variableMetadata.long_name !== undefined) {
            value = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables[variable].variableMetadata.long_name;
        } else if (ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables[variable].variableMetadata.standard_name !== undefined) {
            value = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].variables[variable].variableMetadata.standard_name;
        }

        const option = createOptionForSelect(value, variable);
        if (index === 0) {
            variableToSelect = variable;
        }
        $("#variables-select").append(option);
    });
    $("#variables-select").selectpicker("refresh");

    if (variableToSelect !== "") {
        $("#variables-select").val(variableToSelect);
        $("#variables-select").selectpicker("render");
    }

    buildBaseMenuForSelectedVariable();

    $("#slider-bar").css("left", "50%");
    sizeWindows();
    createGraph();

    $("#loading-for-top-bar").css("display", "none");
    $("#file-metadata-div").empty().append(fileMetadataHtml);
    $("#list-of-variables-div").empty().append(listOfVariablesHtml);
}

updateFileDataAjax = async function (accessURLS, fileType, listOfVariables, dimensionalVariables) {
    const data = {
        urls: JSON.stringify(accessURLS),
        fileType: fileType,
        listOfVariables: JSON.stringify(listOfVariables),
        listOfDimensionalVariable: dimensionalVariables
    }
    const result = await $.ajax({
        data: data,
        type: "POST",
        url: updateFileDataURL,
    });
    if (result.errorMessage !== undefined) {
        notifyOfDanger(result.errorMessage);
        console.error(result.error);
    } else {
        return result.file;
    }
};

export {
    extractTimeseriesAjax,
    formatNotebookWithTimeseriesAjax,
    getFilesAndFoldersFromCatalogAjax,
    getDimensionsAndVariablesForFileAjax,
    hasPermissionToAddAndDeleteAjax,
    updateAndBuildBaseMenu,
    updateFileDataAjax
};