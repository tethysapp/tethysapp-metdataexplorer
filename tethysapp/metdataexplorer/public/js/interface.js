//Get url database info
$('#go-input-button').click(function () {
    $('#loading-modal').modal('show');
    $('#metadata-div').empty();
    $('#var-metadata-div').empty();
    containerAttributes = false;
    if (firstlayeradded == true) {
        removeWMSLayer();
        firstlayeradded == false;
    }
    if (shpfileAdded == true) {
        removeGeojsonLayer();
        shpfileAdded == false;
    }
    getFoldersAndFiles($('#url-input').val());
});

$('.url-list-label').click(function () {
    $('#loading-modal').modal('show');
    $('#metadata-div').empty();
    $('#var-metadata-div').empty();
    containerAttributes = $(this).parents().closest('.url-list').data('thredds');
    $('#metadata-div').empty().append(`<p>${containerAttributes['description'].replace('/n', '<br>')}</p>`);
    removeGeojsonLayer();
    if (containerAttributes['spatial'] !== '') {
        configureBounds(containerAttributes['spatial']);
    }
    if (containerAttributes['type'] == 'file') {
        console.log(containerAttributes['timestamp'])
        if (containerAttributes['timestamp'] == 'true') {
            var url_array = getLatestFile(containerAttributes['url']);
            opendapURL = url_array['latestFileURL']['OPENDAP'];
            wmsURL = url_array['latestFileURL']['WMS'];
            subsetURL = url_array['latestFileURL']['NetcdfSubset'];
            containerAttributes['title'] = url_array['fileName'];
        } else {
            var url_array = containerAttributes['url'].split(',');
            opendapURL = url_array['0'].slice(4);
            wmsURL = url_array['1'].slice(4);
            subsetURL = url_array['2'].slice(4);
        }
        console.log(`opendatURL: ${opendapURL}, wmsURL: ${wmsURL}, subsetURL: ${subsetURL}`);
        addContainerAttributesToUserInputItems();
        updateWMSLayer();
        $('#loading-modal').modal('hide');
    } else {
        if (firstlayeradded == true) {
            removeWMSLayer();
        }
        getFoldersAndFiles(containerAttributes['url']);
    }
});

function addContainerAttributesToUserInputItems() {
    let dimensionsAndVariableMetadata = false;
    if (containerAttributes['attributes'] == '' || containerAttributes['description'] == '' ||
        containerAttributes['time'] == '') {
        let variablesAndFileMetadata = getVariablesAndFileMetadata();
        if (containerAttributes['attributes'] == '') {
            addVariables(variablesAndFileMetadata[0]);
        } else {
            addVariables(containerAttributes['attributes'].split(','));
        }
        if (containerAttributes['time'] == '') {
            dimensionsAndVariableMetadata = getDimensionsAndVariableMetadata();
            addDimensions(dimensionsAndVariableMetadata[0]);
        } else {
            addDimensions([containerAttributes['time']]);
        }
        if (containerAttributes['description'] == '') {
            addFileMetadata(variablesAndFileMetadata[1]);
        }
    } else {
        if (containerAttributes['color'] !== '') {
            $('#wmslayer-bounds').val(containerAttributes['color']);
        }
        addVariables(containerAttributes['attributes'].split(','));
        addDimensions([containerAttributes['time']]);
        $('#filetree-div').css('display', 'none');
        $('#file-info-div').css('display', 'flex');
        $('#layer-display-container').css('display', 'inline');
    }
    if (dimensionsAndVariableMetadata === false) {
        dimensionsAndVariableMetadata = getDimensionsAndVariableMetadata();
    }
    addVariableMetadata(dimensionsAndVariableMetadata[1]);
}

//Buttons for groups and metadata div
$('#file-metadata-button').click(function () {
    $('#var-metadata-div').css('display', 'none');
    $('#metadata-div').css('display', 'block');
    $('#file-metadata-button').css('background-color', '#1600F0');
    $('#var-metadata-button').css('background-color', '#828dcd');
});
$('#var-metadata-button').click(function () {
    $('#metadata-div').css('display', 'none');
    $('#var-metadata-div').css('display', 'block');
    $('#var-metadata-button').css('background-color', '#1600F0');
    $('#file-metadata-button').css('background-color', '#828dcd');
});

$('#demo-group-button').click(function () {
    $('#demo-group-button').attr('data-clicked', 'true');
    $('#user-group-button').attr('data-clicked', 'false');
    if ($('#upload-to-which-group').attr('data-admin') === 'True') {
        $('#upload-to-which-group').empty().append('Upload to: Demo Group');
    }
    $('#demo-group-button').css('background-color', '#1600F0');
    $('#user-group-button').css('background-color', '#828cfa');
    $('#demo-group-container').css('display', 'block');
    $('#user-group-container').css('display', 'none');
})

$('#user-group-button').click(function () {
    $('#demo-group-button').attr('data-clicked', 'false');
    $('#user-group-button').attr('data-clicked', 'true');
    if ($('#upload-to-which-group').attr('data-admin') === 'True') {
        $('#upload-to-which-group').empty().append('Upload to: User Group');
    }
    $('#user-group-button').css('background-color', '#1600F0');
    $('#demo-group-button').css('background-color', '#828cfa');
    $('#user-group-container').css('display', 'block');
    $('#demo-group-container').css('display', 'none');
})

$('#up-file').click(function () {
    if (URLpath.length !== 1) {
        let newURL = URLpath[URLpath.length - 2];
        $('#url-input').val(newURL);
        getFoldersAndFiles(newURL);
        URLpath.pop();
    }
})

$('#add-url').click(function () {
    if ($('#url-input').val() == '') {
        alert('Please enter a url to a Thredds Data Server.')
        return
    } else {
        $('#loading-modal').modal('show');
        containerAttributes = false;
        $('#main-body').css('display', 'none');
        $('#db-forms').css('display', 'block');
        $('#name-in-form').append($('#url-input').val());
        if ($('#name-in-form').attr('data-type') === 'file') {
            let html = '';
            let variables = [];
            $('#variable-input option').each(function () {
                variables.push($(this).val());
            });
            let timeDim = [];
            $('#time option').each(function () {
                timeDim.push($(this).val());
            });
            for (let variable in variables) {
                addAttribute(variables[variable]);
            }
            for (let time in timeDim) {
                html += `<option>${timeDim[time]}</option>`;
            }
            let description = $('#metadata-div').attr('data-description');
            $('#dimensions').append(html);
            $('#description-input').append(description);
        }
        urlInfoBox = true;
        $('#loading-modal').modal('hide');
    }
});

$('#variable-input').change(function () {
    let dimensionsAndVariableMetadata = getDimensionsAndVariableMetadata();
    addVariableMetadata(dimensionsAndVariableMetadata[1]);
    addDimensions(dimensionsAndVariableMetadata[0]);
    updateWMSLayer();
});

$('#wmslayer-style').change(updateWMSLayer);
$('#wmslayer-bounds').change(updateWMSLayer);
$('#opacity-slider').change(function () {
    dataLayerObj.setOpacity($('#opacity-slider').val());
});

$('#link-geoserver').click(function () {
    let geoserverLayer = getGeoserverLayerList();
    let html = '';

    for (let workspace in geoserverLayer) {
        html += `<div style="width: 100%; height: auto;"><b style="padding-left: 0px;">${workspace}</b><br>`;
        for (let store in geoserverLayer[workspace]) {
            html += `<b style="padding-left: 20px">${store}</b><br>`;
            for (let name in geoserverLayer[workspace][store]) {
                html += `<div class="geoserver-layer-div" data-wfsURL="${geoserverLayer[workspace][store][name]}" ondblclick="setGeoserverWFS.call(this)"><b style="padding-left: 40px;">${name}</b></div>`;
            }
        }
    }
    $('#link-geoserver-inner-content').empty().append(html);
    $('#link-geoserver-modal').modal('show');
});

//////////////////////////Form Interface///////////////////////
$('#add-attribute-button').click(function () {
    addAttribute($('#add-attribute').val());
    $('#add-attribute').val('');
});

$('#add-dimension-button').click(function () {
    let dimension = $('#add-dimension').val();
    $('#dimensions').append(`<option selected="selected">${dimension}</option>`);
    $('#add-dimension').val('');
})

$('#add-submit').click(function() {
    if ($('#title-input').val() == '') {
        alert('Please specify a name.');
        return
    } else if ($('#description-input').val() == '') {
        alert('Please include a description.');
        return
    } else {
        createDBArray();
        editing = false;
        urlInfoBox = false;
    }
});

$('#add-cancel').click(function () {
    clearForm();
    $('.delete-url').attr('data-editing', 'false');
    $('#main-body').css('display', 'block');
    $('#db-forms').css('display', 'none');
    editing = false;
    urlInfoBox = false;
});

$('#select-all-button').click(function () {
    if ($('#select-all-button').data('select') === 'true') {
        $('#select-all-button').data('select', 'false')
        $('.attr-checkbox').each(function () {
            $(this).attr('checked', true);
        });
    } else {
        $('#select-all-button').data('select', 'true')
        $('.attr-checkbox').each(function () {
            $(this).attr('checked', false);
        });
    }
});

$('#configure-for-latest').click(function () {
    $('#configure-for-latest-modal').modal('show');
    if ($('#latest-url-input').attr('data-url') == 'false') {
        $('#latest-url-input').val(`${URLpath[URLpath.length - 1].slice(0,-11)}${$('#name-in-form').text()}`);
    } else {
        $('#latest-url-input').val($('#latest-url-input').attr('data-url'));
    }
})

$('#latest-url-confirm').click(function () {
    $('#latest-url-input').attr('data-url', $('#latest-url-input').val());
    $('#configure-for-latest-modal').modal('hide');
});

function setGeoserverWFS() {
    let wfs = $(this).attr('data-wfsURL');
    if (wfs == false) {
        alert('Please enable wfs service on selected layer.');
    } else {
        $('#spatial-input').val(wfs);
        $('#link-geoserver-modal').modal('hide');
    }
}

function clearForm() {
    $('#name-in-form').empty();
    $('#title-input').val('');
    $('#tags-input').val('');
    $('#spatial-input').val('');
    $('#color-range-input').val('');
    $('#description-input').val('');
    $('#attributes').empty();
    $('#dimensions').val('');
    $('#units').val('');
    $('#latest-url-input').val('')
    $('#latest-url-input').attr('data-url', 'false');
}

/////////////////////////////////Geoserver
$('#crate-workspace-button').click(function () {
    let workspace = $('#workspace').val();
    let uri = $('#uri').val();
    $.ajax({
        url: URL_createGeoserverWorkspace,
        data: {
            workspaceName: workspace,
            uri: uri,
        },
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        async: false,
        success: function (result) {
        }
    })
})

$('#configure-geoserver-button').click(function () {
    $('#geoserver-modal').modal('show');
})

$('#upload-shapefile-modal-button').click(function () {
    $('#uploadshp-modal').modal('show');
})
