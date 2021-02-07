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
//Create a geojson layer on the map using the shapefile the user uploaded
function makeGeojsonLayer(geojson) {
    if (shpfileAdded == true) {
        mapObj.removeLayer(shpLayer);
        shpLayer = new L.FeatureGroup().addTo(mapObj);
    }
    //let polygons = geojson;
    let style = {
        "color": "#ffffff",
        "weight": 1,
        "opacity": 0.40,
    };
    shpLayer = L.geoJson(geojson, {
        style: style,
        onEachFeature: EachFeature,
    }).addTo(mapObj);
    shpfileAdded = true;
}

function EachFeature(feature, layer) {
    layer.on({
        click: clickShpLayer
    });
}

function removeGeojsonLayer() {
    if (shpfileAdded == true) {
        mapObj.removeLayer(shpLayer);
        shpfileAdded = false;
    }
}

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
