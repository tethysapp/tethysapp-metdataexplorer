// find if method is csrf safe
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// add csrf token to appropriate ajax requests
$(function() {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
            }
        }
    });
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//LOAD EXISTING USER LAYERS TO MAP
/*function add_user_layers() {
  $.ajax({
    url: URL_user_geojsons,
    dataType: 'json',
    contentType: "application/json",
    method: 'GET',
    success: function (result) {
      geojsons = result['geojson'];
    },
  });
}*/


//Create a geojson layer on the map using the shapefile the user uploaded
function make_file_layer(geojson) {
    if (shpfileAdded == true) {
        mapObj.removeLayer(shpLayer);
        shpLayer = new L.FeatureGroup().addTo(mapObj);
    }
    let polygons = geojson;
    let style = {
        "color": "#ffffff",
        "weight": 1,
        "opacity": 0.40,
    };
    user_layer =  L.geoJSON(polygons, {
        style: style,
        //onEachFeature: EachFeature,
    });
    shpfileAdded = true;
    return user_layer.addTo(shpLayer);
}

//Set the popup for each feature
/*function EachFeature(feature, layer) {
    layer.on('click', function(){
        $('#shp-select > option').each(function() {
            let id = $(this).val();
            if (id != '') {
                let prop = Object.keys(feature.properties);
                let prop2 = $('#' + id + '').data('option_keys');
                let name = $('#' + id + '').data('name');
                if (String(prop) == String(prop2) | String(id) != String(name)) {
                    $('#shp-select').val(name).change();
                }
            }
        });
/!*        layer.bindPopup('<div id="name-insert" style="text-align: center">'
                        + '<h1>' + feature.properties[$('#properties').val()] + '</h1></div>'
                        + '<br><button id="get-timeseries" style="width: 100%; height: 50px;'
                        + 'background-color: aqua" onclick="timeseriesFromShp(`' + String(feature.properties[$('#properties').val()]) + '`)">'
                        + 'Get Timeseries</button><div id="loading" class="loader"></div>');*!/
    });
}*/


//ADD A USER SHAPEFILE TO THE MAP
//Ajax call to send the shapefile to the client side
function uploadShapefile() {
    let files = $('#shapefile-upload')[0].files;

    if (files.length !== 4) {
        alert('The files you selected were rejected. Upload exactly 4 files ending in shp, shx, prj and dbf.');
        return
    }

    let data = new FormData();
    Object.keys(files).forEach(function (file) {
        data.append('files', files[file]);
    });

    $.ajax({
        url: URL_uploadShapefile,
        type: 'POST',
        data: data,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function (result) {
            geojsonName = result['filenames'];
            geojsonFile = result['geojson'];
            $('#uploadshp-modal').modal('hide');
            $('#add-thredds-model').modal('show');
        },
    });
}

function zoomToBounds(bounds) {
    let coords = bounds.slice(2,-2).split(',');
    let corner1 = L.latLng(coords[0].split(' ')[1], coords[0].split(' ')[0]);
    let corner2 = L.latLng(coords[2].split(' ')[2], coords[2].split(' ')[1]);
    mapObj.flyToBounds(L.latLngBounds(corner1, corner2));
}

$('#uploadshp').click(uploadShapefile);
