String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

(function($) {

    $(function() {

        var gSheetId = '0Ah6N8zTBBmsmdE02ZXM2NHpNTmFZYWkydXdhYV9Jb3c',
            sofTemplate = $('#sof-template').html(),
            insertAfter = $('h2');

        gSheet(gSheetId, function(rows){

            // Remove first two items - 0th item will always be empty because
            // Gsheets is 1-indexed, and the 1st item is the column headings
            rows.splice(0, 2);

            rows.map(function(row){
                var sofAnswer = $(sofTemplate.format(row.A, row.B, row.C));
                insertAfter.after(sofAnswer);
                insertAfter = sofAnswer;
            });

        });


    });
})(jQuery);
