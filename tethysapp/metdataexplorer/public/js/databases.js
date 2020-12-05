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
        },
        dataType: 'json',
        contentType: "application/json",
        method: 'GET',
        success: function (result) {

        }
    })
}

$('#add-group').click(function () {$('#add-group-model').modal('show')});
$('#add-group-submit').click(saveGroup);

$('#add-url').click(function () {$('#add-thredds-model').modal('show')});
$('#add-thredds-submit').click(saveThredds);