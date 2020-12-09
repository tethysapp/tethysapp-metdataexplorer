let firstlayeradded = false;
let URLpath = [];
let subsetURL = '';
let wmsURL = '';
let opendapURL = '';
let shpfileAdded = false;

add_user_layers();

function update_filepath() {
  if ($(this).attr('class') == 'folder') {
    let newURL = $(this).attr('data-url');
    $('#url-input').val(newURL);
    get_files(newURL);
  } else if ($(this).attr('class') == 'file') {
    wmsURL = $(this).attr('data-wms-url');
    opendapURL = $(this).attr('data-opendap-url');
    subsetURL = $(this).attr('data-subset-url');
    get_metadata();
  }
}

function get_metadata() {
  $('#loading-model').modal('show');
  $.ajax({
    url: '/apps/metdataexplorer/metadata/',
    data: {'opendapURL': opendapURL,},
    dataType: 'json',
    contentType: "application/json",
    method: 'GET',
    success: function (result) {
      var variablesSorted = result['variables_sorted'];
      if (variablesSorted == false) {
        $('#loading-model').modal('hide');
        alert('Invalid file');
      } else {
        var attrs = result['attrs'];
        print_metadata(variablesSorted, attrs);
        getDimensions();
        update_wmslayer();
        $('#loading-model').modal('hide');
      }
    }
  })
}

function update_wmslayer() {
  if (firstlayeradded == true) {
    layerControlObj.removeLayer(dataLayerObj);
    mapObj.removeLayer(dataLayerObj);
  }
  dataLayerObj = data_layer();
  dataLayerObj.setOpacity($('#opacity-slider').val());
  layerControlObj.addOverlay(dataLayerObj, 'netcdf Layer');
}

function print_metadata(variablesSorted, attrs) {
  var html = '';
  var html2 = '';
  for (var i = 0; i < variablesSorted.length; i++) {
    html += '<option>' + variablesSorted[i] + '</option>';
  }
  $('#variable-input').empty();
  $('#variable-input').append(html);
  for (var att in attrs) {
    html2 += '<b style="padding-left: 40px">' + att + ':<b/><p style="padding-left: 40px">' + attrs[att] + '</p>';
  }
  $('#metadata-div').empty();
  $('#metadata-div').append(html2);
  $('#file-metadata-button').css('background-color', 'rgba(205, 209, 253, 1)');
}

function getDimensions() {
  let variable = $('#variable-input').val();
  $.ajax({
    url: '/apps/metdataexplorer/getDimensions/',
    data: {
      'variable': variable,
      'opendapURL': opendapURL,
    },
    dataType: 'json',
    contentType: "application/json",
    method: 'GET',
    success: function (result) {
      let dims = result['dims'];
      var variables = result['variables'];
      if (variables == false) {
        alert('Invalid THREDDS URL');
      } else {
        let html = ''
        for (var i = 0; i < dims.length; i++) {
          html += '<option>' + dims[i] + '</option>';
        }
        $('#time').empty();
        $('#time').append(html);
        $('#time option:nth-child(3)').attr('selected', 'selected');
        $('#lat').empty();
        $('#lat').append(html);
        $('#lat option:nth-child(1)').attr('selected', 'selected');
        $('#lng').empty();
        $('#lng').append(html);
        $('#lng option:nth-child(2)').attr('selected', 'selected');

        var html3 = '';
        html3 += '<b style="padding-left: 40px">' + variable + ':<b/>'
        for (var attr in variables[variable]) {
          html3 += '<p style="padding-left: 40px">' + attr + ': ' + variables[variable][attr] + '</p>';
        }
        $('#var-metadata-div').empty();
        $('#var-metadata-div').append(html3);
      }
    }
  });
}

function get_files(url) {
  $.ajax({
    url: '/apps/metdataexplorer/buildDataTree/',
    data: {'url': url,},
    dataType: 'json',
    contentType: "application/json",
    method: 'GET',
    success: function (result) {
      var dataTree = result['dataTree'];
      if (dataTree == 'Invalid URL') {
        alert(dataTree)
      } else {
        var correctURL = result['correct_url'];
        let html = ''
        for (var file in dataTree['files']) {
          html += '<div data-wms-url="' + dataTree['files'][file]['WMS'] + '' +
              '" data-subset-url="' + dataTree['files'][file]['NetcdfSubset'] + '' +
              '" data-opendap-url="' + dataTree['files'][file]['OPENDAP'] + '' +
              '" class="file" ' +
              'onclick="update_filepath.call(this)"><p class="far" style="display: inline-block">' +
              '&#xf1c5; ' + file + '</p></div>';
        }
        for (var folder in dataTree['folders']) {
          html += '<div data-url="' + dataTree['folders'][folder] + '" class="folder" ' +
              'onclick="update_filepath.call(this)">' +
              '<p class="fas" style="display: inline-block">&#xf07b; ' + folder + '</p></div>'
        }
        $('#filetree-div').empty();
        $('#filetree-div').append(html);
        $('#url-input').val(correctURL);
        if (URLpath[URLpath.length - 1] !== correctURL) {
          URLpath.push(correctURL);
        }
      }
    }
  });
}

$('#up-file').click(function () {
  if (URLpath.length !== 1) {
    let newURL = URLpath[URLpath.length - 2]
    $('#url-input').val(newURL);
    get_files(newURL);
    URLpath.pop();
  }
})

$('#url-input').change(function () {get_files($('#url-input').val());});
$('#variable-input').change(function () {update_wmslayer();});
$('#wmslayer-style').change(function () {update_wmslayer();});
$('#wmslayer-bounds').change(function () {update_wmslayer();});
$('#opacity-slider').change(function () {dataLayerObj.setOpacity($('#opacity-slider').val())});
$('#variable-input').change(function () {getDimensions();});
$('#upload-shp').click(function() {$('#uploadshp-modal').modal('show')});
$('#file-metadata-button').click(function() {
  $('#var-metadata-div').css('display', 'none');
  $('#metadata-div').css('display', 'block');
  $('#file-metadata-button').css('background-color', 'rgba(205, 209, 253, 1)');
  $('#var-metadata-button').css('background-color', 'rgba(130, 141, 205, 1)');
});
$('#var-metadata-button').click(function() {
  $('#metadata-div').css('display', 'none');
  $('#var-metadata-div').css('display', 'block');
  $('#var-metadata-button').css('background-color', 'rgba(205, 209, 253, 1)');
  $('#file-metadata-button').css('background-color', 'rgba(130, 141, 205, 1)');
});
$('.url-list-label').click(function () {
  let url = $(this).attr('data-url');
  $('#url-input').val(url);
  get_files(url)
});

