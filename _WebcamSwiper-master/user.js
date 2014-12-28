$(document).ready(function(){
    $.cookie.json=true;
    $.cookie.raw=true;
    
    $.each($(".cashable"),function (i,obj) {
        try {
             $(obj).val($.cookie($(this).attr('id')).replace('"','').replace('"',''));
        } catch(e) {
            $(obj).val($.cookie($(this).attr('id')));
        }
    });

    $(".cashable").change(function(){
        $.cookie($(this).attr('id'),$(this).val());
    });
    
});

