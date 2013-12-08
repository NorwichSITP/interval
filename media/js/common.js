var GSHEETID            = '0Ah6N8zTBBmsmdE02ZXM2NHpNTmFZYWkydXdhYV9Jb3c',
    LIVETWEET_USERKEY   = 'TmBELpRE1fSw';


String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-46200679-2', 'norwichsitp.github.io');
ga('send', 'pageview');


$(document).off('keydown.nav').on('keydown.nav', function(e) {
    if (!e.ctrlKey) {
        switch (e.which) {
            case 80:
                window.location.href = '/interval';
                break;

            case 81:
                window.location.href = '/interval/qanda';
                break;

            case 83:
                window.location.href = '/interval/sof';
                break;
        }
    }
});
