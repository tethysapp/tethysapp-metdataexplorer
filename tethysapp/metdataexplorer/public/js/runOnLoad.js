import {setUpMap} from "./mapPackage.js";
import {addAllGroupsToNavigation} from "./htmlPackage.js";
import {addDefaultBehaviorToAjax, sizeWindows} from "./auxilaryPackage.js";
import {setNavigationEventListeners} from "./eventListenersForNavigation.js";
import {setModalEventListeners} from "./eventListenersForModals.js";
import {setBaseMenuEventListeners} from "./eventListenersForBaseMenu.js";
import {buildModalShapefileList} from "./htmlHelpersForModals.js";
import {getDisclaimerAjax} from "./databasePackage.js";

let getDisclaimer = async function () {
    const disclaimer = await getDisclaimerAjax();

    if (disclaimer.message !== "" && disclaimer.message !== null) {
        const header = disclaimer.header;
        const message = disclaimer.message;

        $("#disclaimer-header").append(header);
        $("#disclaimer-message").append(message);
        $("#modalDisclaimer").modal("show");
    }
};

function ready(readyListener) {
    if (document.readyState !== "loading") {
        readyListener();
    } else {
        document.addEventListener("DOMContentLoaded", readyListener);
    }
};

ready(function () {
    addDefaultBehaviorToAjax();
    setUpMap(() => {
        console.log("Map Created");
    });
    $("#slider-bar").draggable({
        axis : "x",
        containment : "#graph-map-btn",
        stop: sizeWindows
     });
    window.location.hash = 1;
    addAllGroupsToNavigation();
    setNavigationEventListeners();
    setModalEventListeners();
    setBaseMenuEventListeners();
    buildModalShapefileList();
    getDisclaimer();
});