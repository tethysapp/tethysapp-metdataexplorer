/* Drawing/Layer Controls */
let drawnItems = new L.FeatureGroup().addTo(mapObj);   // FeatureGroup is to store editable layers
let shpLayer = new L.FeatureGroup().addTo(mapObj);

let drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    edit: true,
  },
  draw: {
    marker: false,
    polyline: false,
    circlemarker: false,
    circle: false,
    polygon: false,
    rectangle: false,
    trash: true,
  },
});

/* Add the controls to the map */
mapObj.addControl(drawControl);

function getDataBounds() {
  let rectangleDrawer = new L.Draw.Rectangle(mapObj);
  rectangleDrawer.enable();
  /* Controls for when drawing on the maps */
}

function getThreddsBounds() {
  $('#main-body').css('display', 'block');
  $('#db-forms').css('display', 'none');
  let rectangleDrawer = new L.Draw.Rectangle(mapObj);
  rectangleDrawer.enable();
}

$('#draw-on-map-button').click(getThreddsBounds);
$('#get-data-button').click(getDataBounds);

drawnItems.on('click', function (e) {
  var coord = e.layer.getLatLngs();
  getTimeseries(coord);
});

shpLayer.on('click', function (e) {
  var coords = e.layer.getBounds();
  console.log(coords);
  var coord = {0:{0:{'lat': coords['_southWest']['lat'], 'lng': coords['_southWest']['lng']},
    1:{'lat': coords['_northEast']['lat'], 'lng': coords['_southWest']['lng']},
    2:{'lat': coords['_northEast']['lat'], 'lng': coords['_northEast']['lng']},
    3:{'lat': coords['_southWest']['lat'], 'lng': coords['_northEast']['lng']}}};
  getTimeseries(coord);
});

mapObj.on(L.Draw.Event.CREATED, function (e) {
  if (urlInfoBox == true) {
    let coord = e.layer.getLatLngs();
    let bounds = '((';
    for (let i = 0; i < 4; i++) {
      bounds += coord[0][i].lng.toFixed(2) + ' ' + coord[0][i].lat.toFixed(2) + ', ';
    }
    bounds += coord[0][0].lng.toFixed(2) + ' ' + coord[0][0].lat.toFixed(2) + '))';
    $('#spatial-extent-label').empty().append(bounds);
    $('#main-body').css('display', 'none');
    $('#db-forms').css('display', 'block');
  } else {
    drawnItems.addLayer(e.layer);
    let coord = e.layer.getLatLngs();
    getTimeseries(coord);
  }
});

