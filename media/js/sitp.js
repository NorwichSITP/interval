(function($, deck) {

    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dateToStr = function(dateObj) {
            // Formats a date as yyyy-mm-dd
            var year = dateObj.getFullYear(),
                month = dateObj.getMonth() + 1,
                day = dateObj.getDate();

            if (month < 10) { month = '0' + month; }
            if (day < 10) { day = '0' + day; }

            return year + '-' + month + '-' + day;
        },
        dateToStrHuman = function(dateObj) {
            // Human-readable date format
            return days[dateObj.getDay()] + ' ' + 
                    dateObj.getDate() + ' ' + 
                    months[dateObj.getMonth()] + ' ' +
                    dateObj.getFullYear() + ', ' +
                    dateObj.getHours() + ':' +
                    dateObj.getMinutes();
        },
        dateDiff = function(date1, date2) {
            // Calculates the date difference, in days, between two
            // dates
            var time1 = Math.floor(date1.getTime() / 86400000), // 1000*60*60*24
                time2 = Math.floor(date2.getTime() / 86400000);

            return time2 - time1;
        },
        threeMonthsAgo = function(fromDate) {
            // Gets the date of the first of the month, 3 months prior
            // to the given date.
            var dd = new Date(fromDate);
            dd.setDate(1);
            dd.setMonth(dd.getMonth() - 3);
            return dd;
        },
        getUrlParam = function(key) {
            key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
            var match = location.search.match(new RegExp("(?:[?&]|^)" + key +
                        "=([^&]+)(?:&|$)"));
            return match && decodeURIComponent(match[1].replace(/\+/g, " "));
        };

    $(function() {

        $(document).bind('deck.init', function() {
            // So we can hide slides until they're all loaded
            $('.slide').addClass('loaded');
        });
        

        var thingsToComplete = 3,  // events, apod, sof
            thingCompleted = function(logMessage) {
                
                if(logMessage) {
                    console.log('DONE: ' + logMessage);
                }

                if(--thingsToComplete == 0){

                    // Deck initialization
                    $.extend(true, $[deck].defaults, {
                        automatic: {
                            startRunning: getUrlParam('auto') != 'false',
                            cycle: true,
                            slideDuration: 60000
                        }
                    });

                    // Start slides
                    $[deck]('.slide');

                }
            };

        // EVENTS ==============================================================

        var todayParam = getUrlParam('today'),
            today = todayParam ? new Date(todayParam) : new Date(),
            social = $('#social'),
            pastEvents = $('#past-events'),
            futureEventTemplate = $('#future-event-template').html(),
            todaysEventTemplate = $('#todays-event-template').html(),
            pastEventTemplate = $('#past-event-template').html(),
            events = new Array(),
            eventsGcalUrl = 'http://www.google.com/calendar/feeds/infloaq9qd28h3qo3ksv2voig4%40group.calendar.google.com/public/full?alt=json-in-script&orderby=starttime&singleevents=true&sortorder=ascending&start-min=' + dateToStr(threeMonthsAgo(today)) + '&fields=entry(title,gd:when,gd:where)&callback=?',
            imageSearch = new google.search.ImageSearch(),
            searchComplete = function(searcher){
                
                // Events should be in chronological order
                data = events.shift();

                // Newly-added events might not have been indexed yet, so skip 
                // them instead of risking using images from other sites.
                if (searcher.results.length) {

                    var titleData = data.title.replace('SitP Norwich - ', '')
                                            .split(':'),
                        speakerName = titleData[0].trim(),
                        eventTitle = titleData.slice(1).join(':').trim(),
                        startTime = data.startTime,
                        imageUrl = searcher.results[0].unescapedUrl;

                    diff = dateDiff(today, startTime);

                    if (diff > 0){  // Future event

                        var eventSlide = futureEventTemplate.format(
                                    speakerName,  
                                    eventTitle,
                                    imageUrl,
                                    dateToStrHuman(startTime),
                                    data.location.replace(/(\r\n|\n|\r)/g,
                                                        '<br />'),
                                    escape(data.location));

                        // Keep future events in order
                        pastEvents.before(eventSlide);

                    } else if (diff < 0) {  // Past event

                        var eventBox = pastEventTemplate.format(
                                speakerName, eventTitle, imageUrl);

                        // Do this instead of pastEvents.append to reverse
                        // the order - most recent will be at top of slide
                        $('h2', pastEvents).after(eventBox);

                    } else {  // Today's event

                        var eventSlide = todaysEventTemplate.format(
                                            speakerName, eventTitle, imageUrl);

                        // "Today's event" slide should be before future / 
                        // past events
                        social.after(eventSlide);

                    }

                }

                if (events.length) {  // Still more events to process
                    imageSearch.execute(events[0].title);
                } else {  // Finish up
                    
                    // If no past events, remove empty slide
                    if(!$('div', pastEvents).length){
                        pastEvents.remove();
                    }

                    // Limit to 3 past events
                    pastEvents.children().slice(4).remove();

                    thingCompleted('EVENTS');

                }
            };

        console.log('TODAY: ' + dateToStr(today));

        imageSearch.setNoHtmlGeneration();
        imageSearch.setResultSetSize(1);
        imageSearch.setSiteRestriction('norwich.skepticsinthepub.org');
        imageSearch.setSearchCompleteCallback(this, searchComplete, [imageSearch]);

        $.getJSON(eventsGcalUrl, function (json) {

            $.each(json.feed.entry,function(i,entry) {
                var eventData = {
                    'title': entry.title.$t,
                    'startTime': entry['gd$when'] ? new Date(entry['gd$when'][0].startTime) : null,
                    'location': entry['gd$where'] ? entry['gd$where'][0].valueString : ''
                    };
                events.push(eventData);

            });

            if (events.length) {
                // Start processing events
                imageSearch.execute(events[0].title);
            } else {

                // No events, so can't be any past events
                pastEvents.remove();

                thingCompleted('EVENTS - None!');

            }

        });


        // BOOKS ===============================================================
        
        var hideBooks = Boolean(getUrlParam('hidebooks')),
            bookSlide = $('#books');

        if (hideBooks) {
            bookSlide.remove();
        }


        // APOD ================================================================

        var apods = new Array(),
            currentApod = 0,
            apodUrl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=http://www.acme.com/jef/apod/rss.xml&num=20&callback=?',
            apodSlide = $('#apod');

        $.getJSON(apodUrl, function (json) {

            $.each(json.responseData.feed.entries, function(i, entry) {
                var img = $('img', $(entry.content));
                if (img.length && img.attr('src')) {
                    apods.push(img.first().attr('src'));
                }
            });

            if (!apods.length) {
                apodSlide.remove();
            } else {
                apodSlide.bind('deck.becameNext', function(ev, direction) {
                    apodSlide.css('background-image', 'url(' + apods[currentApod] +')');
                    currentApod = (++currentApod) % apods.length;
                });
            }

           thingCompleted('APOD'); 

        });


        // SCIENCE OR FICTION ==================================================
        var sofTemplate = $('#sof-template').html(),
            instructionsTemplate = $('#sof-instructions-template').html(),
            answersTemplate = $('#sof-answers-template').html(),
            lastQuote = $('.quote').last(),
            insertAfter = lastQuote;

        gSheet(GSHEETID, function(rows){

            // Remove first two items - 0th item will always be empty because
            // Gsheets is 1-indexed, and the 1st item is the column headings
            rows.splice(0, 2);

            rows.map(function(row){
                var sofSlide = $(sofTemplate.format(row.A, row.B));
                insertAfter.after(sofSlide);
                insertAfter = sofSlide;
            });

            if (rows.length){
                lastQuote.after(instructionsTemplate);
                insertAfter.after(answersTemplate);
            }

            thingCompleted('SOF'); 

        });


        // TWEETS ==============================================================
        var tweetTemplate = $('#tweet-template').html(),
            tweetBox = $('#tweetbox'),
            tweetList = new Array();

        tweetStream(LIVETWEET_USERKEY, function(tweets) {

            tweetList = tweetList.concat(tweets);

            if(tweetList.length) {

                var tweet = tweetList.shift(),
                    tweetHtml = $(tweetTemplate.format(tweet.profile_image_url, 
                                                tweet.username, tweet.text));

                if(!tweetBox.is(':visible')){
                    tweetBox.html(tweetHtml);
                    tweetBox.slideDown();
                } else {
                    tweetHtml.hide();
                    tweetBox.children().fadeOut(1000, function(){
                        tweetBox.html(tweetHtml);
                        tweetHtml.fadeIn(); 
                    });
                }

            } else {

                tweetBox.slideUp();

            }
            
        });

    });
})(jQuery, 'deck');

