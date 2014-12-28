$(document).ready(function(){  
        $(function() {
    $( document ).tooltip({
      track: true
    });
  });

$('#korzina-button').click( function(){
    $(this).parent().hide();
    runEffect();
});

});