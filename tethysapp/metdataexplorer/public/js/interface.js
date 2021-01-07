//Buttons for groups and metadata div
$('#file-metadata-button').click(function() {
  $('#var-metadata-div').css('display', 'none');
  $('#metadata-div').css('display', 'block');
  $('#file-metadata-button').css('background-color', '#1600F0');
  $('#var-metadata-button').css('background-color', 'rgba(130, 141, 205, 1)');
});
$('#var-metadata-button').click(function() {
  $('#metadata-div').css('display', 'none');
  $('#var-metadata-div').css('display', 'block');
  $('#var-metadata-button').css('background-color', '#1600F0');
  $('#file-metadata-button').css('background-color', 'rgba(130, 141, 205, 1)');
});

$('#demo-group-button').click(function (){
  $('#demo-group-button').css('background-color', '#1600F0')
  $('#user-group-button').css('background-color', '#828cfa')
  $('#demo-group-container').css('display', 'block');
  $('#user-group-container').css('display', 'none');
})

$('#user-group-button').click(function (){
  $('#user-group-button').css('background-color', '#1600F0')
  $('#demo-group-button').css('background-color', '#828cfa')
  $('#user-group-container').css('display', 'block');
  $('#demo-group-container').css('display', 'none');
})