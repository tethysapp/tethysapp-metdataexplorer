import {hasPermissionToAddAndDeleteAjax} from "./dataRemoteAccessPackage.js";

let permissionToAdd;
let permissionToDelete;

const permissions = await hasPermissionToAddAndDeleteAjax();

permissionToAdd = function () {
    if (permissions.canAddGroups) {
        return true;
    } else {
        return false;
    }
};

permissionToDelete = function () {
    if (permissions.canDeleteGroups) {
        return true;
    } else {
        return false;
    }
};

export {
    permissionToAdd,
    permissionToDelete
};