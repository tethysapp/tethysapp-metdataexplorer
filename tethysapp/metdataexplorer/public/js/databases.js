let groupName = '';
let groupID = '';

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
    console.log(group)
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

function saveThredds() {
    let name = $('#thredds-title-input').val();
    let url = $('#thredds-url-input').val();
    let tags = $('#thredds-tags-input').val();
    let map = $('#thredds-map-input').val();
    let description = $('#thredds-description-input').val();
    $.ajax({
        url: 'database/saveThredds/',
        data: {
            'name': name,
            'url': url,
            'tags': tags,
            'map': map,
            'description': description,
            'group': groupName,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            $('#add-thredds-model').modal('hide')
            let clone = $('#main-url').clone(true).attr('id', 'cloned').css('display', 'flex');
            $('#' + groupID + '').find('.group-container').append(clone);
            $('#cloned').find('.url-list-label').append('<h4>' + name + '</h4>').attr('data-url', url);
            $('#cloned').removeAttr('id');
        }
    })
}

function deleteURL (){
    let url = $(this).parents('.url-list').attr('data-url');
    console.log('url: ' + url)
    /*$.ajax({
        url: 'database/deleteURL/',
        data: {
            'url': url,
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {
            $('#' + id + '').remove();
        }
    })*/
}

$('#add-group').click(function () {$('#add-group-model').modal('show')});
$('#add-group-submit').click(saveGroup);

$('.add-url').click(function () {
    groupName = $(this).parents('span').attr('data-name');
    groupID = $(this).parents('span').attr('id');
    $('#add-url-group').append(groupName);
    $('#add-thredds-model').modal('show');
});
$('#add-thredds-submit').click(saveThredds);

$('#test').click(function (){
    let newid = 'cloned'
    let name = 'this name'
    let clone = $('#main-url').clone(true).attr('id', newid).css('display', 'block');
    $('#testdiv').append(clone);
    $('#' + newid + '').find('.url-list-label').append('<h4>' + name + '</h4>').attr('data-url', name);
    $('#' + newid + '').removeAttr('id');
})
