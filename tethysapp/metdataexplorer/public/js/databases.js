function addAttribute(attribute) {
    let count = $('.attr-checkbox').length
    let html = `<div style="display: flex; flex-direction: row; margin-top: 5px;"><input id="checkbox${count}" type="checkbox" class="attr-checkbox" checked style="margin: 0px 10px 0px 10px;">
              <label for="checkbox${count}" style="padding: 0px; margin: 0px">${attribute}</label></div>`;
    $('#attributes').append(html);
}

function createDBArray() {
    if ($('#name-in-form').attr('data-type') == 'file') {
        var url = `opd:${opendapURL},wms:${wmsURL},sub:${subsetURL}`;
    } else {
        var url = $('#url-input').val();
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
        URLS: url,
        tags: $('#tags-input').val(),
        spatial: $('#spatial-extent-label').text(),
        colorRange: $('#color-range-input').val(),
        description: $('#description-input').val(),
        attributes: `${attr}`,
        timeDimensions: $('#dimensions').val(),
        units: $('#units').val(),
    };
    console.log(JSON.stringify(databaseInfo))
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
        }
    })
}

function deleteDB () {
    if ($(this).attr('class') == 'delete-url img-button') {
        var all = false;
        let json = $(this).parents().closest('.url-list').attr('data-thredds');
        let thredds_array = JSON.parse(json);
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
    let con = confirm('Are you sure you want to delete ' + dbInfo['title'] + '? This action cannot be undone.')
    if (con == true) {
        if (dbInfo['all']) {
            console.log('HI')
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

/*function deleteAll() {
    let con = confirm('Are you sure you want to delete all groups? This action cannot be undone.')
    if (con == true) {
        $.ajax({
            url: URL_deleteAll,
            dataType: 'json',
            contentType: "application/json",
            method: 'GET',
            success: function (result) {
                $('#groups').empty();
            }
        })
    }
}

function deleteGroup() {
    let group = $(this).parents('span').attr('data-name');
    let id = $(this).parents('span').attr('id');
    let con = confirm('Are you sure you want to delete ' + group + '? This action cannot be undone.')
    if (con == true) {
        $.ajax({
        url: URL_deleteGroup,
        data: {
        'group': group,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            $('#' + id + '').remove();
        }
    })
    }
}

function groupInfo (){
    let group = $(this).parents('span').attr('data-name');
    $.ajax({
        url: URL_groupInfo,
        data: {
        'group': group,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            var group = result['group'];
            $('#database-info-name').empty().append('<p>' + group.name + '</p>');
            $('#database-info-description').empty().append('<p>' + group.description + '</p>');
            $('#database-info-model').modal('show')
        }
    })
}

function threddsInfo (){
    let name = $(this).parents().closest('.url-list').attr('data-name');
    let group = $(this).parents('span').attr('data-name');
    $.ajax({
        url: URL_threddsInfo,
        data: {
            'name': name,
            'group': group,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            var array = result['array'];
            $('#url-info-name').empty().append(array.name);
            $('#url-info-url').empty().append('<p>' + array.url + '</p>');
            $('#url-info-description').empty().append('<p>' + array.description + '</p>');
            $('#url-info-model').modal('show');
        }
    })
}*/

$('#info-box-exit').click(function () {
    urlInfoBox = false;
})
$('#add-group').click(function () {
    $('#add-group-model').modal('show')
});

//$('.info-group').click(groupInfo);
//$('.info-url').click(threddsInfo);
//$('#delete-all-group').click(deleteAll);
//$('#add-group-submit').click(saveGroup);
