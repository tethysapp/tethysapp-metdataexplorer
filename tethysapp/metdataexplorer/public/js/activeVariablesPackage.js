const ACTIVE_VARIABLES_PACKAGE = (function () {

    let allServerData = {};
    let arrayOfCatalogUrls = [];
    let currentCatalogUrl = "";
    let currentGroup = {
        fileId: "",
        groupId: ""
    };
    let dataForGraph = {
        scatter: [],
        box: []
    };
    let fileAndFolderExplorer = {
        currentFileId: "",
        files: {},
        folders: {}
    };
    let geojson = {
        feature: {},
        shapefile: false,
        type: ""
    };
    let threddsFileToAdd = {
        allVariables: [],
        description: "",
        group: "",
        url: {},
        title: "",
        userCredentials: "none",
        variablesAndDimensions: {}
    };
    let userAuthenticationCredentials = {};
    let shapefileNames = {};

    return  {
        allServerData,
        arrayOfCatalogUrls,
        currentCatalogUrl,
        currentGroup,
        dataForGraph,
        fileAndFolderExplorer,
        geojson,
        threddsFileToAdd,
        userAuthenticationCredentials,
        shapefileNames
    };
})();