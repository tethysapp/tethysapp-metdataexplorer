import {setUpMap} from "./mapPackage.js";
import {addAllGroupsToNavigation} from "./htmlPackage.js";
import {addDefaultBehaviorToAjax, sizeWindows} from "./auxilaryPackage.js";
import {setNavigationEventListeners} from "./eventListenersForNavigation.js";
import {setModalEventListeners} from "./eventListenersForModals.js";
import {setBaseMenuEventListeners} from "./eventListenersForBaseMenu.js";
import {buildModalShapefileList} from "./htmlHelpersForModals.js";

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
});