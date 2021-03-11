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
//ToDo Add loading symbole to Geoserver function
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
            let filename = result["filename"];
            let alreadyMade = result["alreadyMade"];
            console.log(alreadyMade)
            if (alreadyMade == true) {
                alert('You already have a shape with this name. Please rename your file and try again.');
            } else {
                $('#spatial-input').val(filename);
                spatial_shape = filename;
                $('#uploadshp-modal').modal('hide');
                console.log(spatial_shape)
            }
        },
    });
}

function zoomToBounds(bounds) {
    let coords = bounds.slice(2,-2).split(',');
    let corner1 = L.latLng(coords[0].split(' ')[1], coords[0].split(' ')[0]);
    let corner2 = L.latLng(coords[2].split(' ')[2], coords[2].split(' ')[1]);
    mapObj.flyToBounds(L.latLngBounds(corner1, corner2));
}

$('#uploadshp').click(function(e) {
    e.preventDefault();
    uploadShapefile();
})

/*Add a shapefile to your geoserver

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
        //processData: false,
        //contentType: false,
        success: function (result) {
            let pathToShp = result["path_to_shp"];
            let filename = result["filename"];
            console.log(pathToShp)
            console.log(filename)
            $.ajax({
                url: URL_uploadShapefileToGeoserver,
                data: {
                    pathToShp: pathToShp,
                    filename: filename,
                    workspace: $('#which-workspace').val(),
                    storeName: $('#store-name').val(),
                },
                dataType: "json",
                contentType: "application/json",
                method: "GET",
                async: false,
                success: function (result) {
                    console.log(result['result']);
                    $('#uploadshp-modal').modal('hide');
                },
            });
        },
    });
}*/
