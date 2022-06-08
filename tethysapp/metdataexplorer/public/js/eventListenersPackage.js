import {notifyOfDanger} from "./userMessagingPackage.js";
import {buildFilesAndFolderExplorer} from "./htmlPackage.js";
import {getFilesAndFoldersFromCatalogAjax} from "./dataRemoteAccessPackage.js";
import {
    generateUniqueId,
    showLoadingModal,
    hideLoadingModal
} from "./auxilaryPackage.js";

let getFilesAndFoldersFromCatalog;
let setActiveGroup;
let setActiveThreddsFile;
let showModalAddFileToDatabase;
let showModalHelp;

getFilesAndFoldersFromCatalog = async function (urlForCatalog, pushCurrentUrlToArray = true) {
    try {
        showLoadingModal("modalAddFileToDatabase");
        const foldersAndFiles = await getFilesAndFoldersFromCatalogAjax(urlForCatalog);

        let uniqueId;
        let html;
        if (pushCurrentUrlToArray) {
            ACTIVE_VARIABLES_PACKAGE.arrayOfCatalogUrls.push(ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl);
            ACTIVE_VARIABLES_PACKAGE.currentCatalogUrl = urlForCatalog;
        }

        ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer = {
            files: {},
            folders: {}
        };
        if (foldersAndFiles.errorMessage !== undefined) {
            notifyOfDanger(foldersAndFiles.errorMessage);
            console.error(foldersAndFiles.error);
        } else {
            for (const [key, value] of Object.entries(foldersAndFiles.files)) {
                uniqueId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[uniqueId] = {
                    title: key,
                    url: value
                };
            }
            for (const [key, value] of Object.entries(foldersAndFiles.folders)) {
                uniqueId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.folders[uniqueId] = {
                    title: key,
                    url: value
                };
            }
            html = buildFilesAndFolderExplorer();
            $("#div-for-folder-and-file-explorer").empty().append(html);
            $('#modalFoldersAndFilesExplorer').modal('show');
        }
        hideLoadingModal("modalAddFileToDatabase");
    } catch (error) {
        notifyOfDanger("An error occurred while accessing the catalog.");
        console.error(error);
    }
};

setActiveGroup = function (groupId) {
    ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId = groupId;
};

setActiveThreddsFile = function (groupId, fileId) {
    ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId = groupId;
    ACTIVE_VARIABLES_PACKAGE.currentGroup.fileId = fileId;
};

showModalAddFileToDatabase = function (groupId) {
    $("#modalAddFileToDatabase").modal("show");
    ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId = groupId;
};

//TODO fill out help model
showModalHelp = function () {
    console.log('show help modal');
};


export {
    getFilesAndFoldersFromCatalog,
    setActiveGroup,
    setActiveThreddsFile,
    showModalAddFileToDatabase,
    showModalHelp,
};