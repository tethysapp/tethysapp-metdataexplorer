let groupName = '';
let groupID = '';
let geojsonName = 'No spatial reference';

function deleteAll() {
    let con = confirm('Are you sure you want to delete all groups? This action cannot be undone.')
    if (con == true) {
        $.ajax({
            url: 'database/deleteAll/',
            dataType: 'json',
            contentType: "application/json",
            method: 'GET',
            success: function (result) {
                $('#groups').empty();
            }
        })
    }
}

function saveGroup() {
    let name = $('#group-title-input').val();
    let description = $('#group-description-input').val();
    $.ajax({
        url: 'database/saveGroup/',
        data: {
        'name': name,
        'description': description,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            $('#add-group-model').modal('hide')
            let newid = $("#groups span").length + 1;
            let clone = $('#main-group').clone(true).attr('id', newid).attr('data-name', name).css('display', 'block');
            $('#groups').append(clone);
            $('#' + newid + '').find('.name').append('<h3>' + name + '</h3>');
            $('#' + newid + '').find('.group-container').css('display', 'block');
        }
    })
}

function deleteGroup() {
    let group = $(this).parents('span').attr('data-name');
    let id = $(this).parents('span').attr('id');
    let con = confirm('Are you sure you want to delete ' + group + '? This action cannot be undone.')
    if (con == true) {
        $.ajax({
        url: 'database/deleteGroup/',
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

function saveThredds() {
    let name = $('#thredds-title-input').val();
    let url = $('#thredds-url-input').val();
    let tags = $('#thredds-tags-input').val();
    let description = $('#thredds-description-input').val();
    $.ajax({
        url: 'database/saveThredds/',
        data: {
            'name': name,
            'url': url,
            'tags': tags,
            'map': geojsonName,
            'description': description,
            'group': groupName,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            $('#add-thredds-model').modal('hide')
            let clone = $('#main-url').clone(true).attr('id', 'cloned').css('display', 'flex').attr('data-url', url).attr('data-name', name).attr('data-spatial', geojsonName);
            $('#' + groupID + '').find('.group-container').append(clone);
            $('#cloned').find('.url-list-label').append('<h4>' + name + '</h4>');
            $('#cloned').removeAttr('id');
            geojsonName = 'No spatial reference'
        }
    })
}

function deleteThredds (){
    let name = $(this).parents().closest('.url-list').attr('data-name');
    let group = $(this).parents('span').attr('data-name');
    let con = confirm('Are you sure you want to delete ' + name + '? This action cannot be undone.')
    if (con == true) {
        $(this).parents().closest('.url-list').remove();
        $.ajax({
            url: 'database/deleteURL/',
            data: {
                'name': name,
                'group': group,
            },
            dataType: 'json',
            contentType: "application/json",
            method: 'GET',
        })
    }
}

function groupInfo (){
    let group = $(this).parents('span').attr('data-name');
    $.ajax({
        url: 'database/groupInfo/',
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
        url: 'database/threddsInfo/',
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
            $('#url-info-model').modal('show')
        }
    })
}

$('.info-group').click(groupInfo);
$('.info-url').click(threddsInfo);

$('#delete-all-group').click(deleteAll);
$('#add-group').click(function () {$('#add-group-model').modal('show')});
$('#add-group-submit').click(saveGroup);

$('.add-url').click(function () {
    groupName = $(this).parents('span').attr('data-name');
    groupID = $(this).parents('span').attr('id');
    $('#add-url-name').append(groupName);
    $('#add-thredds-model').modal('show');
});
$('#add-thredds-submit').click(saveThredds);

$('.url-list-label').click(function () {
  let url = $(this).parents().closest('.url-list').attr('data-url');
  let geoname = $(this).parents().closest('.url-list').attr('data-spatial');
  let geojson = JSON.parse(geojsons[geoname]);
  make_file_layer(geojson);
  $('#url-input').val(url);
  get_files(url)
  var bounds = shpLayer.getBounds();
  mapObj.flyToBounds(bounds);
});
