function addAttribute(attribute) {
    let count = $('.attr-checkbox').length
    let html = `<div style="display: flex; flex-direction: row; margin-top: 5px;"><input id="checkbox${count}" type="checkbox" class="attr-checkbox" checked style="margin: 0px 10px 0px 10px;">
              <label for="checkbox${count}" style="padding: 0px; margin: 0px">${attribute}</label></div>`;
    $('#attributes').append(html);
}

function createDBArray() {
    if (editing === true) {
        $('.delete-url[data-editing="true"]').trigger( "click" );
        var url = containerAttributes['url'];
        console.log(url)
    } else {
        if ($('#name-in-form').attr('data-type') == 'file') {
            var url = `opd:${opendapURL},wms:${wmsURL},sub:${subsetURL}`;
        } else {
            var url = $('#url-input').val();
        }
    }
    let attr = [];
    $('.attr-checkbox').each(function () {
        if (this.checked) {
            attr.push($(this).next('label').text());
        }
    })
    if ($('#demo-group-button').attr('data-clicked') === 'true') {
        var group = 'Demo Group';
        var groupID = 'demo-group-container';
    } else {
        var group = 'User Group';
        var groupID = 'user-group-container';
    }
    let databaseInfo = {
        type: $('#name-in-form').attr('data-type'),
        name: $('#name-in-form').text(),
        group: group,
        title: $('#title-input').val(),
        url: url,
        tags: $('#tags-input').val(),
        spatial: $('#spatial-extent-label').text(),
        colorRange: $('#color-range-input').val(),
        description: $('#description-input').val(),
        attributes: `${attr}`,
        time: $('#dimensions').val(),
        units: $('#units').val(),
    };
    $.ajax({
        url: URL_updateDB,
        dataType: 'json',
        data: databaseInfo,
        contentType: "application/json",
        method: 'GET',
        success: function () {
            $('#main-body').css('display', 'block');
            $('#db-forms').css('display', 'none');
            let clone = $('#main-url').clone(true).attr('id', 'cloned').css('display', 'flex').attr('data-thredds', JSON.stringify(databaseInfo));
            $('#' + groupID + '').find('.group-container').append(clone);
            $('#cloned').find('.url-list-label').append(`<h4>${$('#title-input').val()}</h4>`);
            $('#cloned').removeAttr('id');
            clearForm();
            containerAttributes = false;
            editing = false;
        }
    })
}

function deleteDB () {
    if ($(this).attr('class') == 'delete-url img-button') {
        var all = false;
        let thredds_array = $(this).parents().closest('.url-list').data('thredds');
        var dbInfo = {
            'all': all,
            'title': thredds_array['title'],
            'group': thredds_array['group'],
        }
    } else {
        var all = true;
        var dbInfo = {
            'all': all,
            'title': 'all servers',
        }
    }
    if (editing === false) {
        var con = confirm('Are you sure you want to delete ' + dbInfo['title'] + '? This action cannot be undone.');
    } else {
        var con = true;
    }
    if (con == true) {
        if (dbInfo['all']) {
            $(this).parents().closest('span').children().closest('.group-container').empty();
        } else {
            $(this).parents().closest('.url-list').remove();
        }
        $.ajax({
            url: URL_deleteContainer,
            data: dbInfo,
            dataType: 'json',
            contentType: 'application/json',
            method: 'GET',
        })
    }
}

function editDB () {
    $("#loading-model").modal("show");
    editing = true;
    clearForm();
    $('.delete-url').attr('data-editing', 'false');
    $(this).siblings('.delete-url').attr('data-editing', 'true');
    containerAttributes = $(this).parents().closest('.url-list').data('thredds');
    $('#name-in-form').data('type', containerAttributes['type']);
    $('#name-in-form').text(containerAttributes['name']);
    $('#title-input').val(containerAttributes['title']);
    $('#tags-input').text(containerAttributes['spatial']);
    $('#spatial-extent-label').val(containerAttributes['title']);
    $('#color-range-input').val(containerAttributes['color']);
    $('#description-input').val(containerAttributes['description']);
    $('#dimensions').empty().append(`<option>${containerAttributes['time']}</option>`);
    $('#units').val(containerAttributes['units']);
    let attributes = containerAttributes['attributes'].split(',');
    for (let attribute in attributes) {
        addAttribute(attributes[attribute]);
    }
    $('#main-body').css('display', 'none');
    $('#db-forms').css('display', 'block');
    urlInfoBox = true;
    $("#loading-model").modal("hide");
}

$('#info-box-exit').click(function () {
    urlInfoBox = false;
})
/*$('#add-group').click(function () {
    $('#add-group-model').modal('show')
});*/

function infoDB() {
    if ($(this).attr('class') == 'info-url img-button') {
        containerAttributes = $(this).parents().closest('.url-list').data('thredds');
        $('#info-title').append(containerAttributes['title']);
        $('#info-url').append(containerAttributes['url']);
        $('#info-tags').append(containerAttributes['tags']);
        $('#info-units').append(containerAttributes['units']);
        $('#info-description').append(containerAttributes['description']);
        $('#url-info-model').modal("show");
        containerAttributes = false;
    } else {
        console.log('group Info')
    }
}
