import {createMapMarkerFromLatLon, mapObj} from "./mapPackage.js";
import {notifyOfDanger} from "./userMessagingPackage.js";
import {appProxyURL} from "./urlsPackage.js";

let addLatLonControl;
let createLegend;
let latLonControl;
let wmsLegend;

createLegend = L.Control.extend({
    options: {
        position: "",
        uri: ""
    },

    onAdd: function () {
        const controlClassName = "leaflet-control-wms-legend";
        const legendClassName = "wms-legend";
        const legendTextName = "legend-text";
        const stop = L.DomEvent.stopPropagation;

        this.container = L.DomUtil.create("div", controlClassName);
        this.legendText = L.DomUtil.create("div", legendTextName, this.container);
        this.legendText.innerText = "Legend";
        this.legendText.style.display = "none";
        this.img = L.DomUtil.create("img", legendClassName, this.container);
        this.img.src = `${appProxyURL}?main_url=${this.options.uri}`;

        L.DomEvent
            .on(this.img, "click", this._click, this)
            .on(this.container, "click", this._click, this)
            .on(this.legendText, "click", this._click, this)
            .on(this.img, "mousedown", stop)
            .on(this.img, "dblclick", stop)
            .on(this.img, "click", L.DomEvent.preventDefault)
            .on(this.img, "click", stop);
        this.height = null;
        this.width = null;
        return this.container;
    },
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        const style = window.getComputedStyle(this.img);
        if (style.display === "none") {
            this.container.style.height = this.height + "px";
            this.container.style.width = this.width + "px";
            this.img.style.display = this.displayStyle;
            this.container.style.backgroundColor = "#000000";
            this.legendText.style.display = "none";
        } else {
            if (this.width === null && this.height === null) {
                this.height = this.container.offsetHeight;
                this.width = this.container.offsetWidth;
            }
            this.displayStyle = this.img.style.display;
            this.img.style.display = "none";
            this.container.style.height = "20px";
            this.container.style.width = "80px";
            this.container.style.backgroundColor = "#FFFFFF";
            this.legendText.style.display = "inline";
        }
    },
});

latLonControl = L.Control.extend({
    options: {
        position: "topleft",
    },

    onAdd: function () {
        const mainContainerClassName = "leaflet-lat-lon";
        const textClassName = "lat-lon-text";
        const inputClassName = "lat-lon-input";
        const closeClassName = "close-lat-lon";
        const latLonClassName = "sub-input-lat-lon";
        const addClassName = "add-lat-lon";

        const html = "<label for='lat-input'>Lat</label><input id='lat-input' class='lat-lon-tx-input' type='number' min='-90' max='90'>" +
            "<label for='lon-input'>Lon</label><input id='lon-input' class='lat-lon-tx-input' type='number' min='-180' max='180'>";

        this.mainContainer = L.DomUtil.create("div", mainContainerClassName);
        this.textContainer = L.DomUtil.create("div", textClassName, this.mainContainer);
        this.textContainer.innerHTML = "<i class='fa fa-globe fa-lg' aria-hidden='true'></i>";
        this.inputContainer = L.DomUtil.create("div", inputClassName, this.mainContainer);
        this.closeButton = L.DomUtil.create("div", closeClassName, this.inputContainer);
        this.latLonInput = L.DomUtil.create("div", latLonClassName, this.inputContainer);
        this.addButton = L.DomUtil.create("div", addClassName, this.inputContainer);
        this.closeButton.innerHTML = "<i class='fa fa-times fa-lg' aria-hidden='true'></i>";
        this.latLonInput.innerHTML = html;
        this.addButton.innerHTML = "<i class='fa fa-map-marker fa-lg' aria-hidden='true'></i>";
        this.inputContainer.style.display = "none";

        L.DomEvent
            .on(this.textContainer, "click", this._click, this)
            .on(this.closeButton, "click", this._click, this)
            .on(this.addButton, "click", this._addPoint, this);
        this.height = null;
        this.width = null;
        return this.mainContainer;
    },
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        if (this.inputContainer.style.display === "none") {
            this.inputContainer.style.display = "flex";
            this.textContainer.style.display = "none";
        } else {
            this.inputContainer.style.display = "none";
            this.textContainer.style.display = "flex";
        }
    },
    _addPoint: function(e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        const lat = document.getElementById("lat-input").value;
        const lon = document.getElementById("lon-input").value;

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            notifyOfDanger("Not a valid coordinate.");
        } else {
            createMapMarkerFromLatLon(lat, lon);
            this.inputContainer.style.display = "none";
            this.textContainer.style.display = "flex";
        }
    }
});

addLatLonControl = function () {
    const newLatLonControl = new latLonControl;
    mapObj.addControl(newLatLonControl);
    return newLatLonControl;
};

wmsLegend = function (uri, position) {
    const wmsLegendControl = new createLegend;
    wmsLegendControl.options.uri = uri;
    wmsLegendControl.options.position = position;
    mapObj.addControl(wmsLegendControl);
    return wmsLegendControl;
};

export {
    addLatLonControl,
    wmsLegend
}
