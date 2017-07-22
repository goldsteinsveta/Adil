var modeFake;
var preUrl;
var curUrl;

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                modeFake = JSON.parse(rawFile.responseText).modeFake;
            }
        }
    }
    rawFile.send(null);
}

function parse(curUrl, modeFake) {

	if (curUrl != 'data:,') {

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

	    // old download:
	    // data = {'date' : Date(), 'url' : curUrl, 's' : search, 'modeFake' : modeFake};
		// var link = 'http://httpbin.org/get?' + JSON.stringify(data);
		// chrome.downloads.download({
		// 	url: link
		// });

		var data = {
			"date": Date(), 
			"url": curUrl, 
			"s": search, 
			"modeFake": modeFake
		};
		console.log(data);

		var xhr = new XMLHttpRequest();
	    xhr.open("POST", "http://localhost:8080", true);
	    xhr.setRequestHeader("Content-type", "text/plain");
	    // don't know whether this is useful:
		// xhr.onreadystatechange = function() {//Call a function when the state changes.
		//     if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
		//         // Request finished. Do processing here.
		//     }
		// }
	 	xhr.send(JSON.stringify(data), function(){
	 		watch_loop();
	 	});
	}
}

// watch history loop
function watch_loop() {
	setInterval(function(){
		// get last url in browser histry
		chrome.history.search({
			'text': '', 
			'maxResults': 1,
			'startTime': 0
		}, function(res) {
			// redefine current url
			curUrl = res[0]['url'];
			// compare curUrl with preUrl
			if (curUrl != preUrl) {

				// update modeFake
				readTextFile('data/modeFake.json');
				if (modeFake != true) {
					parse(curUrl, modeFake);
				};

				// update curUrl
				preUrl = curUrl;
			};
		});
	}, 500);
}

// get last url in browser histry
chrome.history.search({
	'text': '', 
	'maxResults': 1, 
	'startTime': 0
}, function(res) {
	preUrl = res[0]['url'];
	// define current url
	var curUrl = preUrl;
	// start watching
	watch_loop();
});