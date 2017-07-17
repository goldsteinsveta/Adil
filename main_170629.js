var fs = require('fs');

// selenium webdriver
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

// chromedriver
var chrome = require('selenium-webdriver/chrome');
var pathChrome = require('chromedriver').path;
// var service = new chrome.ServiceBuilder(pathChrome).build();
// chrome.setDefaultService(service);

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
  screenSize[0] = screenSize[0] - 510;
  chromeOptions.addArguments('window-size=' + screenSize);
  // browser login
  chromeOptions.addArguments('user-data-dir=/Users/' + username + '/Library/Application\ Support/Google/Chrome/Default');
};
var driver;
var watch;

// electron interprocess communication
const ipcMain = require('electron').ipcMain;
const ipcRenderer = require('electron').ipcRenderer;

// electron menubar
var menubar = require('menubar');
var mb = menubar({
  icon: path.join(__dirname, 'public', 'icons' ,'icon_menubar.png'),
  // icon: path.join('file://', __dirname, 'public/icons/icon_menubar.png'),
  index: path.join('file://', __dirname, 'public/index.html'),
  width: 500,
  height: 9999,
  x: 9999,
  alwaysOnTop: true
});

mb.on('ready', function ready () {
  // dom is ready
  ipcMain.on('driver', function(event, screenSize) {
    // build driver
    set_chromeOptions(screenSize);
    driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    // first link
    var preUrl = 'https://accounts.google.com/signin/v2/sl/pwd?hl=de&passive=true&continue=https%3A%2F%2Fwww.google.de%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin&cid=1';
    driver.get(preUrl);

  
    // watch driver
    function watchLoop(){

      // TODO: if driver was closed

      driver
        .getCurrentUrl()
        .then(function() {
          // pass curtUrl
          return driver.getCurrentUrl();
        })
        .then(function(curUrl) {
          // check if curUrl is a new url and not initial webdriver and not initial google login 
          // (sorry for <0, for some mystical reason curUrl.indexOf('?pli=1') !== -1 returns false at any curUrl)
          if (curUrl != preUrl && curUrl != 'data:,' && curUrl.indexOf('?pli=1') < 0) {

            console.log('----> new url!');

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
              }   
            }

            // upd d
            data.push(Date(), curUrl, search);
            console.log(data);

            var dataPath = path.join(__dirname, 'data', 'data.csv');
            // write d
            fs.appendFile(dataPath, data + '\n', function (err) {
              if (err) throw err;
              console.log('----> saved!');
            });

            event.sender.send('newData', data);
            
            // upd preUrl
            preUrl = curUrl;
          };

        }
      );
    }
    watch = setInterval(watchLoop, 10);
  });

});

mb.on('after-create-window', function() {
  mb.window.openDevTools();
  // mb.window.loadUrl();
});

mb.app.on('will-quit', function(){
  // stop watching loop to prevent error
  clearInterval(watch);
  setTimeout(function(){
    driver.quit();
  },1000);
});

ipcMain.on('quit', function(){
  clearInterval(watch);
  // TODO: check stuff to quit, instead of waiting
  setTimeout(function(){
    driver.quit();
  },1000);
  setTimeout(function(){
    mb.app.quit();
  },2000);
});