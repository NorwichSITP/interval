String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

(function($) {

    $(function() {

        $(document).off('keydown.nav').on('keydown.nav', function(e) {
            if(e.which === 80 && !e.ctrlKey){
                window.location.href = '..';
            }
        });

        $('body').on('click', '.tweet', function(e) {
            e.preventDefault();
            $(this).slideUp(function(){
                this.remove();
            });
            return false;
        });

        var userKey = 'TmBELpRE1fSw',
            tweetTemplate = $('#tweet-template').html(),
            body = $('body'),
            displayedTweets = {};

        tweetStream(userKey, function(newTweets, currentTweets) {

            var timeStamp = new Date().getTime();

            $.each(currentTweets, function(i, tweet){

                if(typeof(displayedTweets[tweet.id]) === 'undefined') {

                    tweetHtml = $(tweetTemplate.format(
                            tweet.id,
                            tweet.profile_image_url, 
                            tweet.username,
                            tweet.text));

                    displayedTweets[tweet.id] = {
                        'displayTime': timeStamp,
                        'obj': tweetHtml
                    };

                    tweetHtml.hide();
                    body.append(tweetHtml);
                    tweetHtml.slideDown();

                } else {

                    displayedTweets[tweet.id].displayTime = timeStamp;

                }

            });

            $.each(displayedTweets, function(i, tweet) {
                if(tweet.displayTime !== timeStamp){
                    delete displayedTweets[i];    
                    tweet.obj.slideUp(function(){
                        this.remove();
                    });
                }
            });
        
        }, 15000);

    });
})(jQuery);
