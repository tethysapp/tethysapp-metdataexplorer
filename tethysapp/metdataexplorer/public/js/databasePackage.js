import {
    notifyOfInfo,
    notifyOfDanger,
    notifyOfSuccess
} from "./userMessagingPackage.js";
import {
    addGroupToDatabaseURL,
    removeCredentialsFromServerURL,
    getThreddsFileForSingleGroupURL,
    getCredentialsFromServerURL,
    deleteGroupsFromDatabaseURL,
    deleteFilesFromDatabaseURL,
    addFileToDatabaseURL,
    addCredentialToServerURL,
    getAllGroupsFromServerURL,
    addShapefileToDatabaseURL,
    getShapefileNamesFromDatabaseURL,
    deleteShapefileFromDatabaseURL,
    getShapefileCoordinatesFromDatabaseURL
} from "./urlsPackage.js";
import {htmlForGroupsInNavigation} from "./htmlPackage.js";
import {generateUniqueId} from "./auxilaryPackage.js";

let addCredentialToServerAjax;
let addFileToDatabaseAjax;
let addGroupToDatabaseAjax;
let addShapefileToDatabaseAjax;
let checkForSameNamesAjax;
let deleteFileFromDatabaseAjax;
let deleteGroupsFromDatabaseAjax;
let deleteShapefileFromDatabaseAjax;
let getCredentialsFromServerAjax;
let getGroupsFromDatabaseAjax;
let getFileForSpecificGroupAjax;
let getShapefileCoordinatesFromDatabaseAjax;
let getShapefileNamesFromDatabaseAjax;
let removeCredentialFromServerAjax;

addCredentialToServerAjax = async function (credentialArray) {
    const result = await $.ajax({
        data: credentialArray,
        dataType: "JSON",
        type: "POST",
        url: addCredentialToServerURL,
    });
    return result;
};

addFileToDatabaseAjax = async function () {
    try {
        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions = JSON.stringify(ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions);
        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.url = JSON.stringify(ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.url);
        ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.userCredentials = JSON.stringify(ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.userCredentials);
        const result = await $.ajax({
            data: ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd,
            dataType: 'json',
            type: 'POST',
            url: addFileToDatabaseURL,
        });
        if (result.errorMessage !== undefined) {
                notifyOfDanger(result.errorMessage);
                console.error(result.error);
            } else {
                return result.file;
            }
    } catch (error) {
        notifyOfDanger("An error occurred while retrieving the groups.");
        console.error(error);
    }
};

addGroupToDatabaseAjax = function () {
    const specials = /[*|":<>[\]{}`\\()';@&$]/;
    const newGroup = {
        title: $('#addGroup-title').val(),
        description: $('#addGroup-description').val()
    };

    $("#loading-add-group").removeClass("hidden");
    try {
        if (checkForSameNamesAjax("Group", newGroup.title) == true) {
            $("#loading-add-group").addClass("hidden");
            notifyOfInfo('There is already a group with that name. Please provide a unique name');
            return false;
        }
        if (newGroup.title == "") {
            $("#loading-add-group").addClass("hidden");
            notifyOfInfo('Please enter a title. This field cannot be blank.');
            return false;
        } else if (specials.test(newGroup.title)) {
            $("#loading-add-group").addClass("hidden");
            notifyOfInfo("The following characters are not permitted in the title [ * | \" : < > [ \ ] { } ` \ \ ( ) ' ; @ & $ ]");
            return false;
        }
        if (newGroup.description == "") {
            $("#loading-add-group").addClass("hidden");
            notifyOfInfo('Please enter a description for this group. This field cannot be blank.');
            return false;
        }
        $.ajax({
            data: newGroup,
            dataType: 'json',
            type: 'POST',
            url: addGroupToDatabaseURL,
            success: function (data) {
                const group = data;
                if (group.errorMessage !== undefined) {
                    console.error(group.error);
                    notifyOfDanger(group.errorMessage);
                } else {
                    const groupId = generateUniqueId();
                    let htmlForNavigation;

                    ACTIVE_VARIABLES_PACKAGE.allServerData[groupId] = {
                        description: group.description,
                        files: {},
                        title: group.title
                    };

                    htmlForNavigation = htmlForGroupsInNavigation(groupId);
                    $(htmlForNavigation).appendTo("#groups-in-navigation-container");
                    $("#loading-add-group").addClass("hidden");
                    $("#modalAddGroupToDatabase").modal("hide");
                }
            }
        });
    } catch (error) {
        $("#loading-add-group").addClass("hidden");
        console.error(error);
        notifyOfDanger('There was an error while adding the group to the database');
    };
};

addShapefileToDatabaseAjax = async function (uploadedFiles) {
    try {
        const result = await $.ajax({
            contentType: false,
            data: uploadedFiles,
            dataType: "JSON",
            processData: false,
            type: "POST",
            url: addShapefileToDatabaseURL,
        });
        return result;
    } catch (error) {
        notifyOfDanger("An error occurred while deleting the groups.");
        console.error(error);
    }
};

checkForSameNamesAjax = function (groupOrFile, titleToCheck) {
    //todo Fix this function
    let groupOrFileAlreadyExist = false;
    if (groupOrFile == "Group") {
        for (const [key, value] of Object.entries(ACTIVE_VARIABLES_PACKAGE.allServerData)) {
            if (value.title.trim() == titleToCheck.trim()) {
                groupOrFileAlreadyExist = true;
            }
        }
    }
    if (groupOrFile == "File") {
        add_services_list.forEach(function (single_serv) {
            if (single_serv['title'] == titleToCheck) {
                groupOrFileAlreadyExist = true;
            }
        });
    }
    return groupOrFileAlreadyExist;
};

deleteFileFromDatabaseAjax = function () {
    try {
        const checkedCheckboxes = $(".checkbox-for-delete:checkbox:checked");
        const numberOfFilesNotChecked = $(".checkbox-for-delete:checkbox:not(:checked)").length;

        let files = {
            titles:[],
            fileIds:[]
        }

        for (const checkbox of checkedCheckboxes) {
            files.titles.push(ACTIVE_VARIABLES_PACKAGE.allServerData[ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId].files[checkbox.value].title);
            files.fileIds.push(checkbox.value);
        }

        if (files.titles.length <= 0) {
            notifyOfInfo("Please select a group to delete.");
        } else {
            $.ajax({
                data: files,
                dataType: 'json',
                type: 'POST',
                url: deleteFilesFromDatabaseURL,
                success: function (returnMessage) {
                    if (returnMessage.errorMessage !== undefined) {
                        notifyOfDanger(returnMessage.errorMessage);
                        console.error(returnMessage.error);
                    } else {
                        $("#div-for-delete-groups-table").empty();
                        $("#modalDeleteGroupsFromDatabase").modal("hide");
                        files.fileIds.forEach(fileId => {
                            $(`#container-${fileId}`).remove();
                            delete ACTIVE_VARIABLES_PACKAGE.allServerData[ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId].files[fileId];
                        });

                        if (numberOfFilesNotChecked <= 0) {
                            $(`#${ACTIVE_VARIABLES_PACKAGE.currentGroup.groupId}-noGroups`).css("display", "block");
                        }
                        notifyOfSuccess(returnMessage.successMessage);
                        $("#modalDeleteFileFromDatabase").modal("hide");
                    }
                }
            });
        }
    } catch (error) {
        notifyOfDanger("An error occurred while deleting the groups.");
        console.error(error);
    }
};

deleteGroupsFromDatabaseAjax = function () {
    try {
        const checkedCheckboxes = $(".checkbox-for-delete:checkbox:checked");

        let groups = {
            titles:[],
            groupIds:[]
        }

        for (const checkbox of checkedCheckboxes) {
            groups.titles.push(ACTIVE_VARIABLES_PACKAGE.allServerData[checkbox.value].title);
            groups.groupIds.push(checkbox.value);
        }

        if (groups.titles.length <= 0) {
            notifyOfInfo("Please select a group to delete.");
        } else {
            console.log(groups);
            $.ajax({
                data: groups,
                dataType: 'json',
                type: 'POST',
                url: deleteGroupsFromDatabaseURL,
                success: function (returnMessage) {
                    if (returnMessage.errorMessage !== undefined) {
                        notifyOfDanger(returnMessage.errorMessage);
                        console.error(returnMessage.error);
                    } else {
                        $("#div-for-delete-groups-table").empty();
                        $("#modalDeleteGroupsFromDatabase").modal("hide");
                        groups.groupIds.forEach(groupId => {
                            $(`#panel-${groupId}`).remove();
                            delete ACTIVE_VARIABLES_PACKAGE.allServerData[groupId];
                        });
                        notifyOfSuccess(returnMessage.successMessage);
                    }
                }
            });
        }
    } catch (error) {
        notifyOfDanger("An error occurred while deleting the groups.");
        console.error(error);
    }
};

deleteShapefileFromDatabaseAjax = async function (nameOfShapefileToDelete) {
    try {
        const result = await $.ajax({
            data: nameOfShapefileToDelete,
            dataType: "JSON",
            type: "POST",
            url: deleteShapefileFromDatabaseURL,
        });
        if (result.errorMessage !== undefined) {
            notifyOfDanger(result.errorMessage);
            console.error(result.error);
        } else {
            notifyOfSuccess(result.successMessage);
            return true;
        }
    } catch (error) {
        notifyOfDanger("An error occurred while retrieving the stored credentials.");
        console.error(error);
    }
};

getCredentialsFromServerAjax = async function () {
    try {
        const result = await $.ajax({
            dataType: "JSON",
            type: "GET",
            url: getCredentialsFromServerURL,
        });
        if (result.errorMessage !== undefined) {
            notifyOfDanger(result.errorMessage);
            console.error(result.error);
        } else {
            for (const [key, listOfCredentials] of Object.entries(result.credentials)) {
                const uniqueId = generateUniqueId();
                ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[uniqueId] = {
                    machine: listOfCredentials[0],
                    username: listOfCredentials[1],
                    password: listOfCredentials[2]
                };
            }
            return true;
        }
    } catch (error) {
        notifyOfDanger("An error occurred while retrieving the stored credentials.");
        console.error(error);
    }
};

getGroupsFromDatabaseAjax = async function () {
    try {
        const result = await $.ajax({
            dataType: "JSON",
            type: "GET",
            url: getAllGroupsFromServerURL,
        });
        if (result.errorMessage !== undefined) {
            if (result.error === "'NoneType' object is not callable") {
                notifyOfDanger("An error occurred. Make sure that the database is defined in the app.");
            } else {
                notifyOfDanger(result.errorMessage);
                console.error(result.error);
            }
        } else {
            return result.groups;
        }
    } catch (error) {
        notifyOfDanger("An error occurred while retrieving the groups.");
        console.error(error);
    }
};

getFileForSpecificGroupAjax = async function (groupName) {
    const result = await $.ajax({
        data: {group: groupName},
        dataType: "JSON",
        type: "GET",
        url: getThreddsFileForSingleGroupURL,
    });
    return result.listOfFiles;
};

getShapefileCoordinatesFromDatabaseAjax = async function (shapefileName) {
    const result = await $.ajax({
        data: shapefileName,
        dataType: "JSON",
        type: "POST",
        url: getShapefileCoordinatesFromDatabaseURL,
    });
    return result;
};

getShapefileNamesFromDatabaseAjax = async function () {
    const result = await $.ajax({
        dataType: "JSON",
        type: "GET",
        url: getShapefileNamesFromDatabaseURL,
    });
    return result.listOfShapefileNames;
}

removeCredentialFromServerAjax = async function (credentialArray) {
    const result = await $.ajax({
        data: credentialArray,
        dataType: "JSON",
        type: "POST",
        url: removeCredentialsFromServerURL,
    });
    return result;
};

export {
    addCredentialToServerAjax,
    addFileToDatabaseAjax,
    addGroupToDatabaseAjax,
    addShapefileToDatabaseAjax,
    deleteFileFromDatabaseAjax,
    deleteGroupsFromDatabaseAjax,
    deleteShapefileFromDatabaseAjax,
    getCredentialsFromServerAjax,
    getGroupsFromDatabaseAjax,
    getFileForSpecificGroupAjax,
    getShapefileCoordinatesFromDatabaseAjax,
    getShapefileNamesFromDatabaseAjax,
    removeCredentialFromServerAjax
};