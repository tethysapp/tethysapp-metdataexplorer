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
    createNewDataset,
    deleteFileFromDatabaseAjax,
    deleteGroupsFromDatabaseAjax,
    deleteShapefileFromDatabaseAjax,
    getShapefileCoordinatesFromDatabaseAjax
} from "./databasePackage.js";

import {
    clearModalAddFileToDatabase,
    htmlForFilesInNavigation
} from "./htmlPackage.js";

import {
    addFilesAndFoldersToModalAddFileToDatabase,
    addShapefileNameToTable,
} from "./htmlHelpersForModals.js";
import {createGeojosnMarker} from "./mapPackage.js";
import {createGraph, makeTrace} from "./graphPackage.js";
import {permissionToAdd} from "./permissionsPackage.js";
import {updateAndBuildBaseMenu, updateFileDataAjax} from "./dataRemoteAccessPackage.js";

let setModalEventListeners;

setModalEventListeners = function () {
    //modalAddFileToDatabase
    document.getElementById("information-about-group-button").addEventListener("click", () => {
        if ($("#info-tdsURL").attr("class") === "d-none") {
            $("#info-tdsURL").removeClass("d-none");
        } else {
            $("#info-tdsURL").addClass("d-none");
        }
    });

    document.getElementById("get-url-for-catalog-button").addEventListener("click", () => {
        const urlForCatalog = $('#url-for-catalog').val().trim();
        if (urlForCatalog === "") {
            notifyOfInfo("Please enter a URL to a THREDDS catalog.");
        } else {
            ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.addToDatabase = true;
            ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = urlForCatalog;
            ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls = [];
            getFilesAndFoldersFromCatalog(urlForCatalog, false);
        }
    });

    document.getElementById("search-for-variable").addEventListener("input", () => {
        const idOfInputWithValueToSearch = "search-for-variable";
        const idOfTableToSearch = "table-of-variables";
        searchAndFilterATable(idOfInputWithValueToSearch, idOfTableToSearch);
    });

    document.getElementById("select-all-button").addEventListener("click", () => {
        if ($("#select-all-button").attr("data-bs-select") === "true") {
            $("#select-all-button").empty();
            $("#select-all-button").html(`<i class="bi bi-check2-square"></i>`);
            $("#select-all-button").attr("data-bs-select", "false");
            $(".attr-checkbox").each(function () {
                $(this).prop("checked", false);
            });
        } else {
            $("#select-all-button").empty();
            $("#select-all-button").html(`<i class="bi bi-square"></i>`);
            $("#select-all-button").attr("data-bs-select", "true");
            $(".attr-checkbox").each(function () {
                $(this).prop("checked", true);
            });
        }
    });

    document.getElementById("btn-link-authentication").addEventListener("click", async () => {
        $("#modalUserCredentials").modal("show");
    });

    document.getElementById("add-file-to-database-button").addEventListener("click", async () => {
        let addFile = false;

        if ($("#addService-title").val() === "") {
            notifyOfInfo("A title is required.");
        } else if ($("#addService-description").val() === "") {
            notifyOfInfo("A description is required.");
        } else if ($("#url-for-catalog").val() === "") {
            notifyOfInfo("Please provide a THREDDS Catalog URL.");
        } else {

            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.title = $("#addService-title").val();
            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.description = $("#addService-description").val();

            if (ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.fileType === "catalog") {
                ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.url = {catalog: document.getElementById("url-for-catalog").value};
                addFile = true;
            } else {
                const checkboxes = $(".attr-checkbox:checkbox:not(:checked)");

                if (Object.keys($(".attr-checkbox:checkbox:not(:checked)")).length === Object.keys($(".attr-checkbox")).length) {
                    notifyOfInfo('Please select a variable');
                    addFile = false;
                } else {
                    for (const checkbox of checkboxes) {
                        delete ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[checkbox.value];
                    }
                    for (const [key, value] of Object.entries(ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions)) {
                        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[value.variable] = value.dimensions;
                        delete ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[key];
                    }
                    addFile = true;
                }
            }

            if (addFile) {
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

    //modalAddURLS
    document.getElementById("manual-url-continue-btn").addEventListener("click", () => {
        const opendapURL = document.getElementById("manual-opendap-url").value;
        const wmsURL = document.getElementById("manual-wms-url").value;
        const fileId = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.currentFileId;

        if (opendapURL === "") {
            notifyOfDanger("An OPeNDAP URL is requiered.");
        } else if (wmsURL === "") {
            notifyOfDanger("An OPeNDAP URL is requiered.");
        } else {
            ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url["WMS"] = wmsURL;
            ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url["OPENDAP"] = opendapURL;
            addFilesAndFoldersToModalAddFileToDatabase(fileId, opendapURL);
            $("#modalAddURLS").modal("hide");
            document.getElementById("manual-opendap-url").value = "";
            document.getElementById("manual-wms-url").value = "";
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
            const fileId = clickedElement.closest(".file").id.slice(5);
            const previousFileId = ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId;
            const opendapURL = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url.OPENDAP;
            const wmsURL = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url.WMS;

            ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId = fileId;

            if (opendapURL === undefined || wmsURL === undefined) {
                if (opendapURL !== undefined) {
                    $("#manual-opendap-url").val(opendapURL);
                }
                if (wmsURL !== undefined) {
                    $("#manual-wms-url").val(wmsURL);
                }
                ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.currentFileId = fileId;
                $("#modalFoldersAndFilesExplorer").modal("hide");
                $("#modalAddURLS").modal("show");
            } else {
                if (ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.addToDatabase) {
                    addFilesAndFoldersToModalAddFileToDatabase(fileId, opendapURL);
                } else {
                    const groupId = ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId;
                    ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId = "temp";

                    ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files["temp"] = {
                        accessURLs: ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url,
                        fileType: "catalog",
                        userCredentials: ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[previousFileId].userCredentials,
                        variables: {},
                        dimensionalVariables: []
                    };
                    $("#modalFoldersAndFilesExplorer").modal("hide");
                    $("#loading-for-top-bar").css("display", "flex");
                    updateAndBuildBaseMenu();
                }
            }
        } else if (clickedElement.classList.contains("folder") || clickedElement.parentElement?.classList.contains("folder")) {
            const folderId = event.target.closest(".folder").id.slice(7);
            const urlForCatalog = ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.folders[folderId].url;

            if (urlForCatalog !== undefined) {
                getFilesAndFoldersFromCatalog(urlForCatalog);
            }
        }
    });

    document.getElementById("add-catalog-button").addEventListener("click", (event) => {
        const currentCatalogURL = ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl;
        document.getElementById("url-for-catalog").value = currentCatalogURL;
        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.fileType = "catalog";
        $("#modalFoldersAndFilesExplorer").modal("hide");
        $("#modalAddFileToDatabase").modal("show");
    });

    //modalGraphCalculator
    document.getElementById("data-calculator").addEventListener("click", (event) => {
        const clickedElement = event.target;
        if (clickedElement.classList.contains("calculator-button")) {
            const numberClicked = clickedElement.innerHTML;
            if (numberClicked === "clear") {
                $("#calculator-display").val("");
            } else {
                $("#calculator-display").val($("#calculator-display").val() + numberClicked);
            }
        } else if (clickedElement.classList.contains("calculator-dataset-button")) {
            const numberClicked = $(clickedElement).data("value");
            $("#calculator-display").val($("#calculator-display").val() + numberClicked);
        }
    });

    document.getElementById("calculator-cumulative").addEventListener("click", (event) => {
        const currentExpression = $("#calculator-display").val();
        const newExpression = `Cumulative ${currentExpression} over time`;
        $("#calculator-display").val(newExpression);
    });

    document.getElementById("apply-calc-button").addEventListener("click", async (event) => {
        if ($("#new-dataset-id-input").val() === "") {
            notifyOfInfo("Please name the new dataset.");
        } else {
            const mathExpression = $("#calculator-display").val();
            let listOfDatasets = [];
            let datasetArray = {};

            mathExpression.split("!").forEach((partOfString, index) => {
                if (index % 2 !== 0) {
                    listOfDatasets.push(partOfString);

                    Object.keys(ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter).forEach((dataArrayKey) => {
                        const variable = ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter[dataArrayKey].name;
                        if (variable === partOfString) {
                            datasetArray[partOfString] = {
                                x: ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter[dataArrayKey].x,
                                y: ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter[dataArrayKey].y,
                            };
                        }
                    });

                }
            });

            datasetArray["mathString"] = mathExpression;
            datasetArray["newName"] = $("#new-dataset-id-input").val();
            const newDataset = await createNewDataset(datasetArray);
            console.log(newDataset);

            Object.keys(newDataset).forEach((key) => {
                    if (key !== "datetime") {
                        makeTrace(newDataset[key], newDataset["datetime"], key, key);
                    }
                });
            createGraph();
            $("#modalGraphCalculator").modal("hide");
            $("#calculator-display").empty();
            $("#new-dataset-id-input").empty();
        }
    });

    //modalHelp

    //modalInformationAboutGroup

    //modalListAuthentication

    //btn-save-auth
    document.getElementById("add-credentials-button").addEventListener("click", () => {
        //const credentialId = $(".credential-radio-button:checked").val();
        if ($("#username-input").val() === "" || $("#password-input").val() === "") {
            notifyOfDanger("A username and password are required.");
        } else {
            const credentials = {
                username: $("#username-input").val(),
                password: $("#password-input").val()
            };
            ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.userCredentials = credentials;
            $("#modalUserCredentials").modal("hide");
        }
    });

    //modalMetaDataForVariable

    //modalRemoveVariable

    //modalStyleInformationForWMSLayer

    //modalShapefilelist
    if (permissionToAdd()) {
        document.getElementById("shapefile-list-upload-shapefile-button").addEventListener("click", () => {
            $("#modalUploadAShapefile").modal("show");
        });
    }

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
                $("#select-label-by").empty();
                Object.keys(geojson.geojson.features[0].properties).forEach((property) => {
                    $("#select-label-by").append(`<option value="${property}">${property}</option>`);
                });
                $("#select-label-by").selectpicker("refresh");
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
