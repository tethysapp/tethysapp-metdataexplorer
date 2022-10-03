/*
import {
    addFileMetadata,
    addListOfVariablesToBaseMenu,
    buildBaseMenuForSelectedVariable,
    createOptionForSelect
} from "./htmlPackage.js";
import {sizeWindows} from "./auxilaryPackage.js";
import {createGraph} from "./graphPackage.js";

 */
import {
    populateDeleteGroupsModal,
    htmlForDeleteGroups
} from "./htmlHelpersForModals.js";
import {
    notifyOfDanger,
    notifyOfInfo
} from "./userMessagingPackage.js";
import {
    permissionToAdd,
    permissionToDelete
} from "./permissionsPackage.js";
import {updateAndBuildBaseMenu, updateFileDataAjax} from "./dataRemoteAccessPackage.js";
import {getFilesAndFoldersFromCatalog} from "./eventListenersPackage.js";

let setNavigationEventListeners;

setNavigationEventListeners = function () {
    document.getElementById("help-modal-btn").addEventListener("click", (event) => {
        $("#modalHelp").modal("show");
    });
    // Catalogs container
    if (permissionToAdd()) {
        document.getElementById("add-groups").addEventListener("click", (event) => {
            $("#modalAddGroupToDatabase").modal("show");
        });
    }
    if (permissionToDelete()) {
        document.getElementById("delete-groups").addEventListener("click", (event) => {
            populateDeleteGroupsModal();
        });
    }

    /*
    TODO Fix this event listener
    document.getElementById("filter-groups").addEventListener("click", (event) => {

        $("#modalFilterFilesByVariable").modal("show");
    });
     */

    // Each group container
    document.getElementById("groups-in-navigation-container").addEventListener("click", (event) => {
        const clickedElement = event.target;
        const groupId = clickedElement.closest(".container-for-single-group").id.slice(6);
        ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId = groupId;

        //Group Buttons
        if (clickedElement.classList.contains("group-information") || clickedElement.parentElement?.classList.contains("group-information")) {
            let description_html;
            let groupTitle = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].title;
            let groupDescription = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].description;

            description_html = `<h3>Catalog Title</h3>
                                    <p>${groupTitle}</p>
                                    <h3>Catalog Description</h3>
                                    <p>${groupDescription}</p>`;
            $("#pop-up_description2").html("");
            $("#pop-up_description2").html(description_html);
            $("#modalInformationAboutGroup").modal("show");
        } else if (clickedElement.classList.contains("add-file-to-group") || clickedElement.parentElement?.classList.contains("add-file-to-group")) {
            $("#modalAddFileToDatabase").modal("show");
        } else if (clickedElement.classList.contains("delete-file-from-group") || clickedElement.parentElement?.classList.contains("delete-file-from-group")) {
            try {
                if (Object.keys(ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files).length > 0) {
                    let html = htmlForDeleteGroups(ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files, "File Name");
                    ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId = groupId;
                    $("#div-for-delete-files-table").empty().append(html);
                    $("#modalDeleteFileFromDatabase").modal("show");
                } else {
                    notifyOfInfo("There are no files to delete.");
                }
            } catch (error) {
                notifyOfDanger("An error occurred while opening form");
                console.error(error);
            };
        // File Buttons
        } else if (clickedElement.classList.contains("file-name") || clickedElement.parentElement?.classList.contains("file-name")) {
            const fileId = event.target.closest(".file-and-buttons-container").id.slice(10);
            $(".file-name").css("text-decoration", "none");
            event.target.style.textDecoration = "underline";

            ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId = fileId;

            if (ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].fileType === "catalog") {
                const urlForCatalog = ACTIVE_VARIABLES_PACKAGE.allServerData[groupId].files[fileId].accessURLs.catalog;
                ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.addToDatabase = false;
                ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = urlForCatalog;
                ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls = [];
                getFilesAndFoldersFromCatalog(urlForCatalog, false);
            } else {
                updateAndBuildBaseMenu();
            }

        } else if (clickedElement.classList.contains("refresh-file") || clickedElement.parentElement?.classList.contains("refresh-file")) {
            console.log("refresh the file");
        } else if (clickedElement.classList.contains("edit-file") || clickedElement.parentElement?.classList.contains("edit-file")) {
            console.log("show model to edit file");
        } else if (clickedElement.classList.contains("add-variable") || clickedElement.parentElement?.classList.contains("add-variable")) {
            console.log("show model to add a variable to the file");
        } else if (clickedElement.classList.contains("delete-variable") || clickedElement.parentElement?.classList.contains("delete-variable")) {
            console.log("show model to delete a variable from the file");
        }
    });
};

export {
    setNavigationEventListeners
};
