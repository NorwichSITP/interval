var tweetStream = (function($) {

    return function(userKey, callback, pollFreq) {

        if(typeof(pollFreq) === 'undefined'){
            pollFreq = 30000;
        }

        var pollUrl = 'https://www.livetweetapp.com/api/1/twitter/tweets?status=accepted&user_key=' + userKey,
            seenTweets = {},
            pollFunc = function() {

                $.getJSON('http://query.yahooapis.com/v1/public/yql',
                            {
                                q: 'select * from json where url="' + pollUrl + '"',
                                format: 'json'
                            },
                            function(data){
                                
                                var newTweets = new Array();
                                
                                if(data.query.results){
                                    var json = data.query.results.json,
                                        currentTweets = new Array();

                                    if(typeof(json['json']) !== 'undefined'){
                                        currentTweets = json.json;
                                    } else {
                                        currentTweets.push(json);
                                    }
                                    $.each(currentTweets, function(i, tweet){
                                        if(typeof(seenTweets[tweet.id]) === 'undefined') {
                                            seenTweets[tweet.id] = true;
                                            newTweets.unshift(tweet);
                                        }
                                    });
                                }
                                callback(newTweets, currentTweets);

                            });

            };

        pollFunc();
        setInterval(pollFunc, pollFreq);

    };

})(jQuery);
