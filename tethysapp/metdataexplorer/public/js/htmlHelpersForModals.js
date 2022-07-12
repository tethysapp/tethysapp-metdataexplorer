import { notifyOfDanger, notifyOfInfo } from "./userMessagingPackage.js";
import {
  generateUniqueId,
  hideLoadingModal,
  showLoadingModal,
} from "./auxilaryPackage.js";
import { getShapefileNamesFromDatabaseAjax } from "./databasePackage.js";
import { permissionToDelete } from "./permissionsPackage.js";
import { getDimensionsAndVariablesForFileAjax } from "./dataRemoteAccessPackage.js";
import { addListOfVariablesAndDimensions } from "./htmlPackage.js";

let addDatasetsToCalculator;
let addFilesAndFoldersToModalAddFileToDatabase;
let addShapefileNameToTable;
let buildModalShapefileList;
let htmlForDeleteGroups;
let populateDeleteGroupsModal;

htmlForDeleteGroups = function (arrayToIterate, columnHeader) {
  let html = `<table class="table table-condensed-xs" id="tbl-groups"><thead><th>Select</th><th>${columnHeader}</th></thead><tbody>`;
  for (const [key, value] of Object.entries(arrayToIterate)) {
    html += `<tr>
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
      let html = htmlForDeleteGroups(
        ACTIVE_VARIABLES_PACKAGE.allServerData,
        "Catalog Title"
      );
      $("#div-for-delete-groups-table").empty().append(html);
      $("#modalDeleteGroupsFromDatabase").modal("show");
    } else {
      notifyOfInfo("There are no groups to delete.");
    }
  } catch (error) {
    notifyOfDanger("An error occurred while opening form");
    console.error(error);
  }
};

//modelFileAndFolderExplorer
addFilesAndFoldersToModalAddFileToDatabase = async function (
  fileId,
  opendapURL
) {
  showLoadingModal("modalFoldersAndFilesExplorer");

  let arrayOfVariables = await getDimensionsAndVariablesForFileAjax(opendapURL);
  let html;

  ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.allVariables =
    arrayOfVariables.allVariables;

  if (arrayOfVariables.errorMessage !== undefined) {
    notifyOfDanger("An error occurred while retrieving the variables");
    console.error(arrayOfVariables.error);
  } else {
    ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.url =
      ACTIVE_VARIABLES_PACKAGE.fileAndFolderExplorer.files[fileId].url;
    for (const [key, value] of Object.entries(
      arrayOfVariables.listOfVariables
    )) {
      const id = generateUniqueId();
      ACTIVE_VARIABLES_PACKAGE.threddsFileToAdd.variablesAndDimensions[id] = {
        variable: key,
        dimensions: value,
      };
      html += addListOfVariablesAndDimensions(id, key, value);
    }
    $("#attributes").append(html);
    $(".dimension-selectpicker").selectpicker();
    $("#groups_variables_div").show();
    $("#modalAddFileToDatabase").modal("show");
    $("#modalFoldersAndFilesExplorer").modal("hide");
  }
  hideLoadingModal("modalFoldersAndFilesExplorer");
};

//modalGraphCalculator
addDatasetsToCalculator = function () {
  let html = "";
  Object.keys(ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter).forEach(
    (dataArrayKey) => {
      const variable =
        ACTIVE_VARIABLES_PACKAGE.dataForGraph.scatter[dataArrayKey].name;
      html += `<div class="calculator-dataset-button" data-value=" !${variable}! ">${variable}</div>`;
    }
  );
  $("#calc-dataset-display").empty().append(html);
};

//modalListAuthentication
addCredentialToServer = async function () {
  try {
    if (
      $("#new-credential-machine").val() === "" ||
      $("#new-credential-username").val() === "" ||
      $("#new-credential-password").val() === ""
    ) {
      notifyOfInfo("Please enter a machine, username, and password");
    } else {
      const credentialId = generateUniqueId();
      const credentialArray = {
        machine: $("#new-credential-machine").val().trim(),
        username: $("#new-credential-username").val().trim(),
        password: $("#new-credential-password").val().trim(),
      };

      const resultMessage = await addCredentialToServerAjax(credentialArray);

      if (resultMessage.errorMessage !== undefined) {
        notifyOfDanger(resultMessage.errorMessage);
        console.error(resultMessage.error);
      } else {
        ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId] =
          credentialArray;
        const html = formatRowForModalListAuthentication(credentialId);
        if ($(".row-with-credential:last").length <= 0) {
          $(".no-credentials-row").before(html);
        } else {
          $(".row-with-credential:last").after(html);
        }
        $("#new-credential-machine").val("");
        $("#new-credential-username").val("");
        $("#new-credential-password").val("");
      }
    }
  } catch (error) {
    notifyOfDanger(
      "An error occurred while adding the credential to the server."
    );
    console.error(error);
  }
};

formatEndRowsForModalListAuthentication = function () {
  const html = `<tr id="new-credential-row" class="no-credentials-row">
                        <th scope="col">
                            <span>
                                <input id="no-credentials-radio" type="radio" class="credential-radio-button" name="auth-select" 
                                    value="none" checked>
                            </span>
                        </th>
                        <th scope="col"><span><p>None</p></span></th>
                        <th scope="col"><span></span></th>
                        <th scope="col"><span></span></th>
                        <th scope="col"><span></span></th>
                    </tr>
                    <tr id="new-auth">
                        <th scope="col"><span></span></th>
                        <th scope="col"><input id="new-credential-machine" type="text" 
                            class="form-control" style="height: 1.7em"></th>
                        <th scope="col"><input id="new-credential-username" type="text" 
                            class="form-control" style="height: 1.7em"></th>
                        <th scope="col"><input id="new-credential-password" type="text" 
                            class="form-control" style="height: 1.7em"></th>
                        <th scope="col">  
                            <button id="add-auth" class="add-credential" type="button">
                                <span class="glyphicon glyphicon-plus"></span>
                            </button>
                        </th>
                    </tr>`;
  return html;
};

formatRowForModalListAuthentication = function (credentialId) {
  const html = `<tr id="credential-${credentialId}" class="row-with-credential">
                    <th scope="col">
                        <span>
                            <input type="radio" class="credential-radio-button" name="auth-select" value='${credentialId}'>
                        </span>
                    </th>
                    <th scope="col">
                        <span>
                            <p>${ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId].machine}</p>
                        </span>
                    </th>
                    <th scope="col">
                        <span>
                            <p>${ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId].username}</p>
                        </span>
                    </th>
                    <th scope="col">
                        <span>
                            <p>${ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId].password}</p>
                        </span>
                    </th>
                    <th scope="col">
                        <button id="delete-${credentialId}" class="delete-credential" type="button">
                            <span class="glyphicon glyphicon-trash"></span>
                        </button>
                    </th>
                </tr>`;
  return html;
};

removeCredentialFromServer = async function (credentialId) {
  try {
    const credentialArray =
      ACTIVE_VARIABLES_PACKAGE.userAuthenticationCredentials[credentialId];
    const message = await removeCredentialFromServerAjax(credentialArray);
    if (message.messageError !== undefined) {
      notifyOfDanger(message.messageError);
      console.error(message.error);
    } else {
      $(`#credential-${credentialId}`).remove();
      $("#no-credentials-radio").prop("checked", true);
    }
  } catch (error) {
    notifyOfDanger("An error occurred while removing the credentials.");
    console.error(error);
  }
};

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
                        <i class="bi bi-trash"></i>
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
