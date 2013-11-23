var gSheet = (function($) {

    return function(gSheetId, callback) {

        var gSheetUrl = 'http://spreadsheets.google.com/feeds/cells/' + 
                        gSheetId + 
                        '/od6/public/basic?alt=json-in-script&callback=?';

        $.getJSON(gSheetUrl, function (json) {

            var cellRegex = new RegExp("^([a-zA-Z]+)(\\d+)$");
            var rows = new Array();

            if(json.feed.entry) {
                $.each(json.feed.entry, function(i,entry) {

                    var cell = entry.title.$t,
                        match = cell.match(cellRegex),
                        column = match[1],
                        row = match[2];

                    if(typeof rows[row] == 'undefined') {
                        rows[row] = new Object();
                    }

                    rows[row][column] = entry.content.$t;

                });
            }

            callback(rows);

        });
    };

})(jQuery);
