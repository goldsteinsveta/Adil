// selenium webdriver
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

// chromedriver
var chrome = require('selenium-webdriver/chrome');
var pathChrome = require('chromedriver').path;


// get mac username for browser login
var path = require('path');
var appPath = path.dirname(require.main.filename);
var pathAfterUser = appPath.substring( appPath.indexOf('/Users/') + '/Users/'.length);
var username = pathAfterUser.substring(0, pathAfterUser.indexOf('/'));
global.username = username;

// browser setup
var chromeOptions = new chrome.Options();
function set_chromeOptions(screenSize) {
  // screenSize to browser size
  screenSize[0] = screenSize[0] - 360;
  chromeOptions.addArguments('window-size=' + screenSize);
  // browser login
  chromeOptions.addArguments('user-data-dir=/Users/' + username + '/Library/Application\ Support/Google/Chrome/Default');
  // chrome extension
  console.log(appPath + '/crx/crxAdil');
  chromeOptions.addArguments('load-extension=' + appPath + '/crx/crxAdil');
};

// build driver
set_chromeOptions([400,600]);
driver = new webdriver.Builder()
  .withCapabilities(webdriver.Capabilities.chrome())
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

driver.manage().timeouts().setScriptTimeout(90000);

var wikiUrl = 'https://zh.wikipedia.org/wiki/Wikipedia:%E9%A6%96%E9%A1%B5';

var curUrl;
function get_curUrl() {
	driver
	.getCurrentUrl()
	.then(function() {
	    return driver.getCurrentUrl();
	})
	.then(function(x){
		curUrl = x;
	});
}

function load_wiki() {
	get_curUrl();
	
	if (curUrl == wikiUrl) {
		console.log('----> at zh.wiki');
		driver.findElement(By.xpath('//*[@id="n-randompage"]/a')).click();	
		load_article();
	}
	else {
		setTimeout(load_wiki, 1000);
	}
}
function load_article() {

	get_curUrl();
	if (curUrl == wikiUrl) {
		setTimeout(load_article, 1000);
	}
	else {
		// get string
		// ('https://zh.wikipedia.org/wiki/').length == 30;
		var s = curUrl.substring(30, curUrl.length);

		// search string
		driver.get('https://www.google.de/search?q=' + s + '"');
		driver.executeScript("window.history.go(-2)");
		load_wiki();
	}
}

driver.get(wikiUrl);
load_wiki();




