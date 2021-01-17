//Get url database info
$("#go-input-button").click(function () {
    $("#loading-model").modal("show");
    containerAttributes = false;
    getFoldersAndFiles($("#url-input").val());
});

$('.url-list-label').click(function () {
    $("#loading-model").modal("show");
    containerAttributes = $(this).parents().closest('.url-list').data('thredds');
    $('#metadata-div').empty().append(`<p>${containerAttributes['description'].replace('/n', '<br>')}</p>`);
    if (containerAttributes['type'] == 'file') {
        let url_array = containerAttributes['url'].split(',');
        opendapURL = url_array['0'].slice(4);
        wmsURL = url_array['1'].slice(4);
        subsetURL = url_array['2'].slice(4);
        addContainerAttributesToUserInputItems();
        updateWMSLayer();
    } else {
        getFoldersAndFiles(containerAttributes['url']);
    }
});

function addContainerAttributesToUserInputItems() {
    if (containerAttributes['color'] !== '') {
        $('#wmslayer-bounds').val(containerAttributes['color']);
    }
    addVariables(containerAttributes['attributes'].split(','));
    addDimensions([containerAttributes['time']]);
    $('#filetree-div').css('display', 'none');
    $('#file-info-div').css('display', 'flex');
    $('#layer-display-container').css('display', 'inline');
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
    $('#upload-to-which-group').empty().append('Upload to: Demo Group');
    $('#demo-group-button').css('background-color', '#1600F0');
    $('#user-group-button').css('background-color', '#828cfa');
    $('#demo-group-container').css('display', 'block');
    $('#user-group-container').css('display', 'none');
})

$('#user-group-button').click(function () {
    $('#demo-group-button').attr('data-clicked', 'false');
    $('#user-group-button').attr('data-clicked', 'true');
    $('#upload-to-which-group').empty().append('Upload to: User Group');
    $('#user-group-button').css('background-color', '#1600F0');
    $('#demo-group-button').css('background-color', '#828cfa');
    $('#user-group-container').css('display', 'block');
    $('#demo-group-container').css('display', 'none');
})

$("#up-file").click(function () {
    if (URLpath.length !== 1) {
        let newURL = URLpath[URLpath.length - 2];
        $("#url-input").val(newURL);
        getFoldersAndFiles(newURL);
        URLpath.pop();
    }
})

$('#add-url').click(function () {
    if ($('#url-input').val() == '') {
        alert('Please enter a url to a Thredds Data Server.')
        return
    } else {
        $("#loading-model").modal("show");
        containerAttributes = false;
        $('#main-body').css('display', 'none');
        $('#db-forms').css('display', 'block');
        $('#name-in-form').append($('#url-input').val());
        if ($('#name-in-form').attr('data-type') === 'file') {
            let html = '';
            let variables = [];
            $("#variable-input option").each(function () {
                variables.push($(this).val());
            });
            let timeDim = [];
            $("#time option").each(function () {
                timeDim.push($(this).val());
            });
            for (let variable in variables) {
              addAttribute(variables[variable]);
            }
            for(let time in timeDim) {
              html += `<option>${timeDim[time]}</option>`;
            }
            let description = $("#metadata-div").attr('data-description');
            $('#dimensions').append(html);
            $('#description-input').append(description);
        }
        urlInfoBox = true;
        $("#loading-model").modal("hide");
    }
});

$("#upload-shp").click(function () {
    $("#add-thredds-model").modal("hide");
    $("#uploadshp-modal").modal("show");
});
$("#variable-input").change(function () {
    updateWMSLayer();
    getDimensionsAndVariableMetadata();
});
$("#wmslayer-style").change(updateWMSLayer);
$("#wmslayer-bounds").change(updateWMSLayer);
$("#opacity-slider").change(function () {
    dataLayerObj.setOpacity($("#opacity-slider").val());
});

//////////////////////////Form Interface///////////////////////
$('#add-attribute-button').click(function () {
    addAttribute($('#add-attribute').val());
    $('#add-attribute').val('');
});

$('#add-submit').click(createDBArray);

$('#add-cancel').click(function () {
    clearForm();
    $('#main-body').css('display', 'block');
    $('#db-forms').css('display', 'none');
    urlInfoBox = false;
});

$('#select-all-button').click(function () {
    if ($('#select-all-button').data('select') === 'true') {
        $('#select-all-button').data('select','false')
        $('.attr-checkbox').each(function () {
            $(this).attr( "checked", true );
        });
    } else {
        $('#select-all-button').data('select','true')
        $('.attr-checkbox').each(function () {
            $(this).attr( "checked", false );
        });
    }
});

function clearForm() {
    $('#name-in-form').empty();
    $('#title-input').val('');
    $('#tags-input').val('');
    $('#spatial-extent-label').empty();
    $('#color-range-input').val('');
    $('#description-input').val('');
    $('#attributes').empty();
    $('#dimensions').val('');
    $('#units').val('');
}