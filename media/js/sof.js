(function($) {

    $(function() {

        $('body').on('click', '.sof-answer-card', function(e) {
            e.preventDefault();
            $(this).parent('.sof-answer-box').toggleClass('revealed');
            return false;
        });

        var sofTemplate = $('#sof-template').html(),
            insertAfter = $('h2');

        gSheet(GSHEETID, function(rows){

            // Remove first two items - 0th item will always be empty because
            // Gsheets is 1-indexed, and the 1st item is the column headings
            rows.splice(0, 2);

            rows.map(function(row){
                var sofAnswer = $(sofTemplate.format(row.A, row.B, row.C,
                                                     row.D));
                insertAfter.after(sofAnswer);
                insertAfter = sofAnswer;
            });

        });


    });
})(jQuery);
