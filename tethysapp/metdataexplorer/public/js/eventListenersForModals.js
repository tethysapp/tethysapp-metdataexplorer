import {notifyOfDanger, notifyOfInfo} from "./userMessagingPackage.js";
import {getFilesAndFoldersFromCatalog} from "./eventListenersPackage.js";
import {
    generateUniqueId,
    hideLoadingModal,
    searchAndFilterATable,
    showLoadingModal
} from "./auxilaryPackage.js";
import {
    addFileToDatabaseAjax,
    addGroupToDatabaseAjax,
    addShapefileToDatabaseAjax,
    deleteFileFromDatabaseAjax,
    deleteGroupsFromDatabaseAjax,
    deleteShapefileFromDatabaseAjax,
    getCredentialsFromServerAjax,
    getShapefileCoordinatesFromDatabaseAjax
} from "./databasePackage.js";
import {
    addListOfVariablesAndDimensions,
    clearModalAddFileToDatabase,
    htmlForFilesInNavigation
} from "./htmlPackage.js";
import {getDimensionsAndVariablesForFileAjax} from "./dataRemoteAccessPackage.js";
import {
    addCredentialToServer,
    addShapefileNameToTable,
    formatEndRowsForModalListAuthentication,
    formatRowForModalListAuthentication,
    removeCredentialFromServer
} from "./htmlHelpersForModals.js";
import {createGeojosnMarker} from "./mapPackage.js";

let setModalEventListeners;

setModalEventListeners = function () {
    //modalAddFileToDatabase
    document.getElementById("information-about-group-button").addEventListener("click", () => {
        if ($("#info-tdsURL").attr("class") === "hidden") {
            $("#info-tdsURL").removeClass("hidden");
        } else {
            $("#info-tdsURL").addClass("hidden");
        }
    });

    document.getElementById("get-url-for-catalog-button").addEventListener("click", () => {
        const urlForCatalog = $('#url-for-catalog').val().trim();
        if (urlForCatalog === "") {
            notifyOfInfo("Please enter a URL to a THREDDS catalog.");
        } else {
            ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = urlForCatalog;
            ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls = [];
            getFilesAndFoldersFromCatalog(urlForCatalog, false);
        }
    });

    document.getElementById("search-for-variable").addEventListener("click", () => {
        const idOfInputWithValueToSearch = "search-for-variable";
        const idOfTableToSearch = "table-of-variables";
        searchAndFilterATable(idOfInputWithValueToSearch, idOfTableToSearch);
    });

    document.getElementById("select-all-button").addEventListener("click", () => {
        if ($("#select-all-button").attr("data-select") === "true") {
            $("#select-all-button").empty();
            $("#select-all-button").html(`<span class="glyphicon glyphicon-check"></span>`);
            $("#select-all-button").attr("data-select", "false");
            $(".attr-checkbox").each(function () {
                $(this).prop("checked", false);
            });
        } else {
            $("#select-all-button").empty();
            $("#select-all-button").html(`<span class="glyphicon glyphicon-unchecked"></span>`);
            $("#select-all-button").attr("data-select", "true");
            $(".attr-checkbox").each(function () {
                $(this).prop("checked", true);
            });
        }
    });

    document.getElementById("btn-link-authentication").addEventListener("click", async () => {
        let html;
        ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials = {};
        showLoadingModal("modalAddFileToDatabase");

        if (await getCredentialsFromServerAjax()) {
            if (Object.keys(ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials).length > 0) {
                Object.keys(ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials).forEach( uniqueId => {
                    html += formatRowForModalListAuthentication(uniqueId);
                    console.log(html)
                });
            }
            html += formatEndRowsForModalListAuthentication();
            $("#added-auth-credentials").empty().append(html);
        }
        $("#modalListAuthentication").modal("show");
        hideLoadingModal("modalAddFileToDatabase");
    });

    document.getElementById("add-file-to-database-button").addEventListener("click", async () => {
        if ($("#addService-title").val() === "") {
            notifyOfInfo("A title is required.");
        } else if ($("#addService-description").val() === "") {
            notifyOfInfo("A description is required.");
        } else if ($("#url-for-catalog").val() === "") {
            notifyOfInfo("Please provide a THREDDS Catalog URL.");
        } else {
                const checkboxes = $(".attr-checkbox:checkbox:not(:checked)");

                ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.title = $("#addService-title").val();
                ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.description = $("#addService-description").val();

            if (Object.keys($(".attr-checkbox:checkbox:not(:checked)")).length === Object.keys($(".attr-checkbox")).length) {
                notifyOfInfo('Please select a variable');
            } else {
                for (const checkbox of checkboxes) {
                    delete ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[checkbox.value];
                }
                for (const [key, value] of Object.entries(ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions)) {
                    ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[value.variable] = value.dimensions;
                    delete ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[key];
                }
                const groupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;

                ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.group = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].title;
                showLoadingModal("modalAddFileToDatabase");

                const fileToAdd = await addFileToDatabaseAjax();
                const fileId = generateUniqueId();

                ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId] = fileToAdd;

                const htmlForFiles = htmlForFilesInNavigation(groupId, fileId);

                $(htmlForFiles).appendTo(`#separator-${groupId}`);
                $(`#${groupId}-noGroups`).css("display", "none");
                clearModalAddFileToDatabase();
                hideLoadingModal("modalAddFileToDatabase");
                $("#modalAddFileToDatabase").modal("hide");
            }
        }
    });

    //modalAddGroupToDatabase
    document.getElementById("add-group-to-database-button").addEventListener("click", () => {
        if ($('#title-input').val() == '') {
            alert('Please specify a name.');
        } else if ($('#description-input').val() == '') {
            alert('Please include a description.');
        } else {
            addGroupToDatabaseAjax();
        }
    });

    //modalAddVariables

    //modalDeleteFileFromDatabase
    document.getElementById("delete-file-from-group-button").addEventListener("click", () => {
        deleteFileFromDatabaseAjax();
    });

    //modalDeleteGroupFromDatabase
    document.getElementById("delete-group-from-database-button").addEventListener("click", () => {
        deleteGroupsFromDatabaseAjax();
    });

    //modalEditFileTitleAndDescription

    //modalEnterURLForWMFService

    //modalFilterFilesByVariable

    //modalFoldersAndFilesExplorer
    //TODO fix this event listener
    document.getElementById("up-a-level-btn").addEventListener("click", () => {
        if (ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls.length <= 0) {
            notifyOfDanger("Already at the top level.");
        } else {
            ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls.pop();
            getFilesAndFoldersFromCatalog(ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl, false);
        }
    });

    document.getElementById("div-for-folder-and-file-explorer").addEventListener("click", async (event) => {
        const clickedElement = event.target;

        if (clickedElement.classList.contains("file") || clickedElement.parentElement?.classList.contains("file")) {
            showLoadingModal("modalFoldersAndFilesExplorer");
            const fileId = event.target.closest(".file").id.slice(5);
            const opendapURL = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url.OPENDAP;
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
                $("#modalFoldersAndFilesExplorer").modal("hide");
            }

            hideLoadingModal("modalFoldersAndFilesExplorer");

        } else if (clickedElement.classList.contains("folder") || clickedElement.parentElement?.classList.contains("folder")) {
            const folderId = event.target.closest(".folder").id.slice(7);
            const urlForCatalog = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.folders[folderId].url;

            if (urlForCatalog !== undefined) {
                ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = urlForCatalog;
                ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls = [];
                getFilesAndFoldersFromCatalog(urlForCatalog);
            }
        }
    });

    //modalHelp

    //modalInformationAboutGroup

    //modalListAuthentication
    document.getElementById("added-auth-credentials").addEventListener("click", (event) => {
        const clickedElement = event.target;
        if (clickedElement.classList.contains("delete-credential") || clickedElement.parentElement?.classList.contains("delete-credential")) {
            const credentialId = clickedElement.closest(".delete-credential").id.slice(7);
            removeCredentialFromServer(credentialId);
        } else if (clickedElement.classList.contains("add-credential") || clickedElement.parentElement?.classList.contains("add-credential")) {
            addCredentialToServer();
        }
    });

    document.getElementById("btn-save-auth").addEventListener("click", () => {
        const credentialId = $(".credential-radio-button:checked").val();
        if (credentialId != "none") {
            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.userCredentials = ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId];
        } else {
            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.userCredentials = credentialId;
        }
        $("#modalListAuthentication").modal("hide");
    });

    //modalMetaDataForVariable

    //modalRemoveVariable

    //modalStyleInformationForWMSLayer

    //modalShapefilelist
    document.getElementById("shapefile-list-upload-shapefile-button").addEventListener("click", () => {
        $("#modalUploadAShapefile").modal("show");
    });

    document.getElementById("shapefile-list").addEventListener("click", (event) => {
        const clickedElement = event.target;

        if (clickedElement.classList.contains("delete-shapefile") || clickedElement.parentElement?.classList.contains("delete-shapefile")) {
            const idOfShapefileToDelete = clickedElement.closest(".delete-shapefile").value;
            const nameOfShapefileToDelete = {name: ACTIVE_VARIABLES_PACKAGE.shapefileNames[idOfShapefileToDelete]};
            const result = deleteShapefileFromDatabaseAjax(nameOfShapefileToDelete);
            if (result) {
                $(`#shapefile-group-${idOfShapefileToDelete}`).remove();
            }
        }
    });

    document.getElementById("add-shapefile-to-map-button").addEventListener("click", async () => {
        if ($(".shapefile-radio-button:checked").val() !== undefined) {
            showLoadingModal("modalShapefileList");
            const shapefileId = $(".shapefile-radio-button:checked").val();
            const shapefileName = {name: ACTIVE_VARIABLES_PACKAGE.shapefileNames[shapefileId]};

            const geojson = await getShapefileCoordinatesFromDatabaseAjax(shapefileName);
            if (geojson.errorMessage !== undefined) {
                notifyOfDanger(geojson.errorMessage);
                console.error(geojson.error);
            } else {
                createGeojosnMarker(geojson.geojson);
                ACTIVE_VARIABLES_PACKAGE.geojson.type = geojson.name;
                ACTIVE_VARIABLES_PACKAGE.geojson.shapefile = true;
                ACTIVE_VARIABLES_PACKAGE.geojson.feature = geojson.geojson;
            }
            hideLoadingModal("modalShapefileList");
            $("#modalShapefileList").modal("hide");
        } else {
            notifyOfInfo("Please select a shapefile.");
        }
    });

    //modalUploadAShapefile
    document.getElementById("upload-shapefile-button").addEventListener("click", async () => {
        try {
            showLoadingModal("modalShapefileList");
            $("#modalUploadAShapefile").modal("hide");
            const uploadedFilesUnsorted = $('#shapefile-upload')[0].files;

            if (uploadedFilesUnsorted.length !== 4) {
                notifyOfDanger("The files you selected were rejected. Upload exactly 4 files ending in shp, shx, prj and dbf.");
            } else {
                const filesForDatabase = new FormData();

                Object.keys(uploadedFilesUnsorted).forEach(function (oneFile) {
                    filesForDatabase.append('uploadedFiles', uploadedFilesUnsorted[oneFile]);
                });

                const shapefileArray = await addShapefileToDatabaseAjax(filesForDatabase);

                if (shapefileArray.errorMessage !== undefined) {
                    notifyOfDanger(shapefileArray.errorMessage);
                    console.error(shapefileArray.error);
                } else {
                    const uniqueId = generateUniqueId();
                    ACTIVE_VARIABLES_PACKAGE.shapefileNames[uniqueId] = shapefileArray.name;
                    const html = addShapefileNameToTable(uniqueId, shapefileArray.name);
                    $("#shapefile-list").append(html);
                }
            }
            hideLoadingModal("modalShapefileList");
        } catch (error) {
            notifyOfDanger("An error occurred while saving the shapefile");
            console.error(error);
        };
    });
};

export {
    setModalEventListeners
};
