window.onload = function() {
var currFFZoom = 1;
var currIEZoom = 100;

function initZoom() {
    if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6){//Firefox
        currFFZoom = 1.75; 
        $('body').css('MozTransform','scale(' + currFFZoom + ')');
    } else {
        currIEZoom = 175;
        $('body').css('zoom', ' ' + currIEZoom + '%');
    }    
}

$('#In').on('click',function(){
    if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6){//Firefox
        var step = 0.02;
        currFFZoom += step; 
        $('body').css('MozTransform','scale(' + currFFZoom + ')');
    } else {
        var step = 2;
        currIEZoom += step;
        $('body').css('zoom', ' ' + currIEZoom + '%');
    }
});

$('#Out').on('click',function(){
    if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6){//Firefox
        var step = 0.02;
        currFFZoom -= step;                 
        $('body').css('MozTransform','scale(' + currFFZoom + ')');

    } else {
        var step = 2;
        currIEZoom -= step;
        $('body').css('zoom', ' ' + currIEZoom + '%');
    }
});};


