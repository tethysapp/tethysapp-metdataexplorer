import {
    notifyOfDanger,
    notifyOfInfo
} from "./userMessagingPackage.js";
import {
    generateUniqueId,
    hideLoadingModal,
    showLoadingModal
} from "./auxilaryPackage.js";
import {
    getShapefileNamesFromDatabaseAjax,
} from "./databasePackage.js";
import {
    permissionToDelete
} from "./permissionsPackage.js";
import {getDimensionsAndVariablesForFileAjax} from "./dataRemoteAccessPackage.js";
import {addListOfVariablesAndDimensions} from "./htmlPackage.js";

let addDatasetsToCalculator;
let addFilesAndFoldersToModalAddFileToDatabase;
let addShapefileNameToTable;
let buildModalShapefileList;
let htmlForDeleteGroups;
let populateDeleteGroupsModal;


htmlForDeleteGroups = function (arrayToIterate, columnHeader) {
    let html = `<table class="table table-condensed-xs" id="tbl-groups"><thead><th>Select</th><th>${columnHeader}</th></thead><tbody>`;
    for (const [key, value] of Object.entries(arrayToIterate)) {
        html +=
        `<tr>
            <td><input class="chkbx-group checkbox-for-delete" type="checkbox" name="server" value="${key}"></td>
            <td>${value.title}</td>
        </tr>`;
    }
    html += "</tbody></table>";
    return html;
};

populateDeleteGroupsModal = function () {
    try {
        const allGroups = Object.keys(ACTIVE_VARIABLES_PACKAGE.allServerData);
        if (allGroups !== undefined && allGroups.length > 0) {
            let html = htmlForDeleteGroups(ACTIVE_VARIABLES_PACKAGE.allServerData, "Catalog Title");
            $("#div-for-delete-groups-table").empty().append(html);
            $("#modalDeleteGroupsFromDatabase").modal("show");
        } else {
            notifyOfInfo("There are no groups to delete.");
        }
    } catch (error) {
        notifyOfDanger("An error occurred while opening form");
        console.error(error);
    };
};

//modelFileAndFolderExplorer
addFilesAndFoldersToModalAddFileToDatabase = async function (fileId, opendapURL) {
    showLoadingModal("modalFoldersAndFilesExplorer");

    let arrayOfVariables = await getDimensionsAndVariablesForFileAjax(opendapURL);
    let html;

    ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.allVariables = arrayOfVariables.allVariables;

    if (arrayOfVariables.errorMessage !== undefined) {
        notifyOfDanger("An error occurred while retrieving the variables");
        console.error(arrayOfVariables.error);

    } else {
        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.url = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url;
        for (const [key, value] of Object.entries(arrayOfVariables.listOfVariables)) {
            const id = generateUniqueId();
            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[id] = {
                variable: key,
                dimensions: value
            };
            html += addListOfVariablesAndDimensions(id, key, value);
        };
        $("#attributes").append(html);
        $(".dimension-selectpicker").selectpicker();
        $("#groups_variables_div").show();
        $("#modalAddFileToDatabase").modal("show");
        $("#modalFoldersAndFilesExplorer").modal("hide");
    }
    hideLoadingModal("modalFoldersAndFilesExplorer");
}

//modalGraphCalculator
addDatasetsToCalculator = function () {
    let html = "";
    Object.keys(ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter).forEach((dataArrayKey) => {
        const variable = ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter[dataArrayKey].name;
        html += `<div class="calculator-dataset-button" data-value=" !${variable}! ">${variable}</div>`
    });
    $("#calc-dataset-display").empty().append(html);
};

//modalListAuthentication

//modalMetaDataForVariable

//modalRemoveVariable

//modalStyleInformationForWMSLayer

//modalShapefileList
buildModalShapefileList = async function () {
    try {
        const listOfShapefileNames = await getShapefileNamesFromDatabaseAjax();
        let html = "";

        if (listOfShapefileNames.errorMessage !== undefined) {
            notifyOfDanger("An error occurred while opening the dialog");
            console.error(listOfShapefileNames.error);
        } else {
            listOfShapefileNames.forEach((name) => {
                const uniqueId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.shapefileNames[uniqueId] = name;
                html += addShapefileNameToTable(uniqueId, name);
            });
            $("#shapefile-list").empty().append(html);
        }
    } catch (error) {
        notifyOfDanger("An error occurred while building the base menu");
        console.error(error);
    }
};

addShapefileNameToTable = function (uniqueId, name) {
        let html = `<tr id="shapefile-group-${uniqueId}">
            <th scope="col">
                <span>
                    <input type="radio" class="shapefile-radio-button" name="auth-select" value="${uniqueId}">
                </span>
            </th>
            <th scope="col"><span><p class="shapefile-name">${name}</p></span></th>
            <th scope="col">`;

        if (permissionToDelete()) {
            html += `<button class="delete-shapefile" type="button" value="${uniqueId}">
                        <span class="glyphicon glyphicon-trash"></span>
                     </button>`;
        }

        html += `</th></tr>`;
    return html;
};

//modalUploadAShapefile

export {
    //addCredentialToServer,
    addDatasetsToCalculator,
    addFilesAndFoldersToModalAddFileToDatabase,
    addShapefileNameToTable,
    buildModalShapefileList,
    //formatEndRowsForModalListAuthentication,
    //formatRowForModalListAuthentication,
    htmlForDeleteGroups,
    populateDeleteGroupsModal,
    //removeCredentialFromServer
};