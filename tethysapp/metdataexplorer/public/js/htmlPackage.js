import {notifyOfDanger} from "./userMessagingPackage.js";
import {createWMSLayer} from "./mapPackage.js";
import {generateUniqueId} from "./auxilaryPackage.js";
import {
    getGroupsFromDatabaseAjax,
    getFileForSpecificGroupAjax
} from "./databasePackage.js";
import {
    permissionToAdd,
    permissionToDelete
} from "./permissionsPackage.js";
import {
    addAdditionalDimension,
    timeDimensionContainer,
    xyDimensionContainer
} from "./htmlHelpersForBaseMenu.js";

let addAllGroupsToNavigation;
let addAllFilesToNavigation;
let addFileMetadata;
let addListOfVariablesAndDimensions;
let addListOfVariablesToBaseMenu;
let addValuesToDimensionValueSelect;
let buildBaseMenuForSelectedVariable;
let buildFilesAndFolderExplorer;
let clearModalAddFileToDatabase;
let createOptionForSelect;
let htmlForGroupsInNavigation;
let htmlForFilesInNavigation;



addAllGroupsToNavigation = async function () {
    try {
        let allGroups;
        let description;
        let htmlForGroups;
        let title;
        let groupId;

        allGroups = await getGroupsFromDatabaseAjax();
        if (allGroups !== undefined) {
            $("#div-for-servers").empty();
            allGroups.forEach( function (group) {
                title = group.title;
                description = group.description;
                groupId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.allServerData[groupId] = {
                    description: description,
                    files: {},
                    title: title
                };
                $(`#${groupId}-noGroups`).show();
                htmlForGroups = htmlForGroupsInNavigation(groupId);
                $(htmlForGroups).appendTo("#groups-in-navigation-container");
                addAllFilesToNavigation(groupId);
            });
        } else {
            console.log("No groups added");
            return;
        }
    } catch (error) {
        notifyOfDanger("An error occurred while loading the groups.");
        console.error(error);
    }
};

addAllFilesToNavigation = async function (groupId) {
    try {
        const allFiles = await getFileForSpecificGroupAjax(
            ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].title);

        if (allFiles.errorMessage !== undefined) {
            notifyOfDanger(allFiles.errorMessage);
            console.error(allFiles.error);
        } else if (allFiles !== undefined) {
            if (allFiles.length <= 0) {
                $(`#${groupId}-noGroups`).show();
            } else {
                $(`#${groupId}-noGroups`).hide();
            }

            allFiles.forEach( function (currentFile) {
                const fileId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId] = currentFile;
                const htmlForFiles = htmlForFilesInNavigation(groupId, fileId);
                $(htmlForFiles).appendTo(`#separator-${groupId}`);
            });
        } else {
            console.log("No files to add");
        }
    } catch (error) {
        notifyOfDanger("An error occurred while adding the files to the navigation.");
        console.error(error);
    }
};

addFileMetadata = function (file = true, variable = null) {
    const currentGroupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
    const currentFileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
    let metadata;
    if (file) {
        metadata = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].fileMetadata;
    } else {
        metadata = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].variables[variable].variableMetadata;
    }

    let html = "";

    Object.keys(metadata).forEach((label, index) => {
        let colorClass;

        if (index % 2 === 0) {
            colorClass = "darker";
        } else {
            colorClass = "lighter";
        }

        html += `<div class="file-metadata-outer-div">
                    <div class="file-metadata-inner ${colorClass}"><p>${label}</p></div>
                    <div class="file-metadata-inner ${colorClass}"><p>${metadata[label]}</p></div>
                </div>`;
    });
    return html;
};

addListOfVariablesAndDimensions = function (id, variable, listOfDimenions) {
    let html = "";
    let options = "";
    listOfDimenions.forEach(dimension => {
        options += `<option selected>${dimension}</option>`;
    });
        html += `<tr>
                    <td class="checkbox-column">
                        <input type="checkbox" class="attr-checkbox" checked value="${id}"  name="variable">
                    </td>
                    <td class="variable-name-column">
                        <label>${variable}</label>
                    </td>
                    <td class="dimensions-selectpicker-column">
                        <select class="dimension-selectpicker" data-live-search="false" data-width="100%" data-style="btn-primary" title="Select a dimension" multiple>${options}</select>
                    </td>
                </tr>`;
    return html;
};

addListOfVariablesToBaseMenu = function () {
    const currentGroupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
    const currentFileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
    const listOfVariables = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId].variables;
    let html = "";

    Object.keys(listOfVariables).forEach((variable, index) => {
        let colorClass;

        if (index % 2 === 0) {
            colorClass = "darker";
        } else {
            colorClass = "lighter";
        }

        html += `<div class="file-metadata-outer-div" xmlns="http://www.w3.org/1999/html">
                    <div class="file-metadata-inner ${colorClass}"><p>${variable}</p></div>
                    <div class="file-metadata-inner ${colorClass}" style="width: calc(50% - 10em)"><p>${listOfVariables[variable].dimensions.join(", ")}</p></div>
                    <div class="file-metadata-inner metadata-info-icon ${colorClass}" style="width: 10em">
                        <button value="${variable}" class="metadata-info btn btn-primary">
                          <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>`;
    });
    return html;
};

addValuesToDimensionValueSelect = function (selectIdForValues, valuesToAdd, firstOrLast) {
    let valueToSelect;

    if (Array.isArray(valuesToAdd)) {
        valuesToAdd.forEach((value, index) => {
            const option = createOptionForSelect(value);

            if (firstOrLast === "first" && index === 0) {
                valueToSelect = value;
            } else if (firstOrLast === "last" && index === valuesToAdd.length - 1) {
                valueToSelect = value;
            }
            $(`#${selectIdForValues}`).append(option);
        });
    } else {
        const option = createOptionForSelect("No Values");
        valueToSelect = "No Values";
        $(`#${selectIdForValues}`).append(option)
    }
    $(`#${selectIdForValues}`).selectpicker("refresh");
    $(`#${selectIdForValues}`).val(valueToSelect);
    $(`#${selectIdForValues}`).selectpicker("render");
};

buildBaseMenuForSelectedVariable = function () {
    try {
        const currentGroupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
        const currentFileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
        const currentFile = ACTIVE_VARIABLES_PACKAGE.allServerData[currentGroupId].files[currentFileId];
        const selectedVariable = $("#variables-select").val();
        const variableDimensions = currentFile.variables[selectedVariable].dimensions;
        const wmsLayerStyle = currentFile.variables[selectedVariable].wmsDisplayColor;
        const wmsValueRange = currentFile.variables[selectedVariable].valueRange;

        $("#time-dimensions-div").empty();
        $("#x-dimension-div").empty();
        $("#y-dimension-div").empty();

        variableDimensions.forEach(dimension => {
            const dimensionType = currentFile.dimensions[dimension].dimensionType;
            const valuesToAdd = currentFile.dimensions[dimension].values;
            let htmlForDimension;

            if (dimensionType === "time") {
                htmlForDimension = timeDimensionContainer(dimension);
                $("#time-dimensions-div").append(htmlForDimension);
                addValuesToDimensionValueSelect(`dimension-time-${dimension}-first`, valuesToAdd, "first");
                addValuesToDimensionValueSelect(`dimension-time-${dimension}-second`, valuesToAdd, "last");
            } else if (dimensionType === "x") {
                htmlForDimension = xyDimensionContainer(dimension, "x");
                $("#x-dimension-div").append(htmlForDimension);
                $(`#dimension-x-${dimension}-first`).append(`${valuesToAdd[0]}`);
                $(`#dimension-x-${dimension}-second`).append(`${valuesToAdd[valuesToAdd.length - 1]}`);
            } else if (dimensionType === "y") {
                htmlForDimension = xyDimensionContainer(dimension, "y");
                $("#y-dimension-div").append(htmlForDimension);
                $(`#dimension-y-${dimension}-first`).append(valuesToAdd[0]);
                $(`#dimension-y-${dimension}-second`).append(valuesToAdd[valuesToAdd.length - 1]);
            } else if (dimensionType === "other") {
                htmlForDimension = addAdditionalDimension(dimension);
                $("#additional-dimensions-div").append(htmlForDimension);
                addValuesToDimensionValueSelect(`dimension-additional-${dimension}-select-values`, valuesToAdd, "first");
                $(`#dimension-additional-${dimension}-select-values`).on("changed.bs.select", () => {
                    createWMSLayer();
                });
            }
        });

        $("#wmslayer-style").val(wmsLayerStyle);
        $("#wmslayer-style").selectpicker("render");
        $("#wms-bound-min").val(wmsValueRange.min);
        $("#wms-bound-max").val(wmsValueRange.max);
        createWMSLayer();
    } catch (error) {
        notifyOfDanger("An error occurred while building the base menu.");
        console.error(error);
    }
};

buildFilesAndFolderExplorer = function () {
    const files = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files;
    const folders = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.folders;
    let html = `<tbody>`;
    if (files !== undefined && !Object.keys(files).length <= 0) {
        for (const [fileId, fileTitleAndURLS] of Object.entries(files)) {
            html += `
                <tr>
                    <td>
                        <div id="file-${fileId}" class="file">
                            <span class="file-folder-icon glyphicon glyphicon-file"></span>
                            <p class="file-folder-text">${fileTitleAndURLS.title}</p>
                        </div>
                    </td>
                </tr>`;
        }
    }
    if (folders !== undefined && !Object.keys(folders).length <= 0) {
        for (const [folderId, folderTitleAndURLS] of Object.entries(folders)) {
            html +=
                `<tr>
                    <td> 
                        <div id="folder-${folderId}" class="folder">
                            <span class="file-folder-icon glyphicon glyphicon-folder-open"></span>
                            <p class="file-folder-text">${folderTitleAndURLS.title}</p>
                        </div>
                    </td>
                </tr>`;
        }
    }
    html += `</tbody>`;
    return html;
};

clearModalAddFileToDatabase = function () {
    $("#addService-title").val("");
    $("#addService-description").val("");
    $("#url-for-catalog").val("");
    $("#attributes").empty();
    $("#groups_variables_div").css("display", "none");
    ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd = {
        allVariables: [],
        description: "",
        group: "",
        url: {},
        title: "",
        userCredentials: "none",
        variablesAndDimensions: {}
    };
};

createOptionForSelect = function (innerText) {
    const html = `<option value="${innerText}">${innerText}</option>`;
    return html
};

htmlForGroupsInNavigation = function (groupId) {
    let groupTitle = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].title;
    let newHtml;

    if (permissionToAdd()) {
        newHtml = `
            <div class="container-for-single-group panel panel-default" id="panel-${groupId}">
                <div class="panel-heading buttonAppearance" role="tab">
                    <h4 class="panel-title tool_tip_h" data-toggle="tooltip" data-placement="right" title="${groupTitle}">
                        <a role="button" data-toggle="collapse" data-target="#collapse_${groupId}" href="#collapse_${groupId}" aria-expanded="true" aria-controls="collapse_${groupId}">
                            <span class="group-name">${groupTitle}</span>
                        </a>
                    </h4>
                    <li class="file-and-buttons-container buttonAppearance" layer-name="none">
                        <button class="group-information btn btn-primary btn-sm">
                            <span class="glyphicon glyphicon-info-sign"></span>
                        </button>
                        <button class="add-file-to-group btn btn-primary btn-sm">
                            <span class="glyphicon glyphicon-plus"></span>
                        </button>
                        <button class="delete-file-from-group btn btn-primary btn-sm">
                            <span class="glyphicon glyphicon-trash"></span>
                        </button>
                    </li>
                </div>
                <div id="collapse_${groupId}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading_${groupId}">
                    <div class="iconhydro"><img src="https://img.icons8.com/dusk/24/000000/ssd.png"/>THREDDS Files</div>
                        <div class="panel-body">
                            <div id="separator-${groupId}" class="divForServers">
                            <button class="btn btn-danger btn-block" id="${groupId}-noGroups"> The group is empty</button>
                        </div>
                    </div>
                </div>
            </div>`;
        return newHtml;
    } else {
        newHtml = `
            <div class="container-for-single-group panel panel-default" id="panel-${groupId}">
                <div class="panel-heading buttonAppearance" role="tab">
                    <h4 class="panel-title tool_tip_h" data-toggle="tooltip" data-placement="right" title="${groupTitle}">
                        <a role="button" data-toggle="collapse" data-target="#collapse_${groupId}" href="#collapse_${groupId}" aria-expanded="true" aria-controls="collapse_${groupId}">
                            <span class="group-name">${groupTitle}</span>
                        </a>
                    </h4>
                    <li class="file-and-buttons-container buttonAppearance" id="${groupId}" layer-name="none">
                        <button class="group-information btn btn-primary btn-sm">
                            <span class="glyphicon glyphicon-info-sign"></span>
                        </button>
                    </li>
                </div>
                <div id="collapse_${groupId}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading_${groupId}">
                    <div class="panel-body">
                        <div id="separator-${groupId}" class="divForServers"></div>
                    </div>
                </div>
            </div>`;

        return newHtml;
    }
};

htmlForFilesInNavigation = function (groupId, fileId) {
    try {
        let newHtml;
        let currentFile = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId];

        if (permissionToDelete()) {
            newHtml = `
                <li class="file-and-buttons-container" id="container-${fileId}">
                    <span  id= "span-${fileId}" class="file-name" data-toggle="tooltip" data-placement="right" title="${currentFile.title}">${currentFile.title}</span>
                    <!--TODO fix these buttons
                    <button class="refresh-file btn btn-default btn-xs">
                        <span class="glyphicon glyphicon-refresh"></span>
                    </button>
                    <button class="edit-file btn btn-default btn-xs">
                        <span class="glyphicon glyphicon-cog"></span>
                    </button>
                    <button class="add-variable btn btn-default btn-xs">
                        <span class="glyphicon glyphicon-plus"></span>
                    </button>
                    <button class="delete-variable btn btn-default btn-xs">
                        <span class="glyphicon glyphicon-trash"></span>
                    </button>-->
                </li>`;
          return newHtml;

        } else {
            newHtml = `
                <li class="file-and-buttons-container" id="container-${fileId}">
                    <span  id= "span-${fileId}" class="file-name" data-toggle="tooltip" data-placement="right" title="${currentFile.title}">${currentFile.title}</span>
                    <button class="edit-file btn btn-default btn-xs">
                        <span class="glyphicon glyphicon-cog"></span>
                    </button>
                </li>`;
            return newHtml;
        }
    } catch (error) {
        notifyOfDanger("An error occurred while loading the files.");
        console.error(error);
    }
};

export {
    addAllGroupsToNavigation,
    addFileMetadata,
    addListOfVariablesToBaseMenu,
    addListOfVariablesAndDimensions,
    buildFilesAndFolderExplorer,
    buildBaseMenuForSelectedVariable,
    clearModalAddFileToDatabase,
    createOptionForSelect,
    htmlForFilesInNavigation,
    htmlForGroupsInNavigation,
};
