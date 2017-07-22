var fs = require('fs');
var request = require('request');

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
  screenSize[0] = screenSize[0] - 370;
  chromeOptions.addArguments('window-size=' + screenSize);
  // browser login
  chromeOptions.addArguments('user-data-dir=/Users/' + username + '/Library/Application\ Support/Google/Chrome/Default');
  // chrome extension
  console.log(appPath + '/crx/crxAdil');
  chromeOptions.addArguments('load-extension=' + appPath + '/crx/crxAdil');
};
var driver;
var watch;

// current url
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
};
//modeFake
var modeFake;
function modeFake_is(mode) {
  modeFake = mode;
  // tell crx
  var mf = JSON.parse(fs.readFileSync(appPath + '/crx/crxAdil/data/modeFake.json', 'utf8'));
  mf.modeFake = modeFake;
  fs.writeFile(appPath + '/crx/crxAdil/data/modeFake.json', JSON.stringify(mf), 'utf-8', function(err) {
    if (err) throw err
  });
}

// electron interprocess communication
const ipcMain = require('electron').ipcMain;
const ipcRenderer = require('electron').ipcRenderer;

// electron menubar
var menubar = require('menubar');
var mb = menubar({
  index: path.join('file://', __dirname, 'public/index.html'),
  width: 350,
  height: 9999,
  x: 9999,
  alwaysOnTop: true,
  tooltip: 'Adil\'s watching'
});


mb.on('ready', function ready () {
  // menubar icon
  const {Tray} = require('electron');
  var iconPath = path.join(__dirname, 'IconTemplate.png')
  const app_icon = new Tray(iconPath);
  // show adil
  mb.showWindow();

  // dom is ready
  ipcMain.on('driver', function(event, screenSize) {
    modeFake_is(false);
    if (driver == undefined) {
      // build driver
      set_chromeOptions(screenSize);
      driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      // first link
      var preUrl = 'http://datavalueadded.org/Adil/';
      driver.get(preUrl);
    };

    // watch driver
    // TODO: if driver was closed
    function watchLoop(){
      var data = [];
      // go to file
      // TODO: get (1).json etc
      var data_fsPath = '/Users/' + username + '/Downloads/get.json';

      if (fs.existsSync(data_fsPath)) {
        console.log("file found");

        var prefix = 'http://httpbin.org/get?'
        var data_fs = JSON.parse(fs.readFileSync(data_fsPath, 'utf8'))['url'];

        data_fs = JSON.parse(data_fs.substring(data_fs.indexOf(prefix) + prefix.length, data_fs.length));

        // check in which mode the link was requested
        if (data_fs['modeFake'] == false) {

          data[0] = data_fs['date'];
          data[1] = unescape(data_fs['url']);
          data[2] = data_fs['s'];

          event.sender.send('newData', data);

          // write data
          var dataPath = path.join(__dirname, 'data', 'data.csv');
          fs.appendFile(dataPath, data + '\n', function (err) {
            if (err) throw err;
            console.log('----> saved!');

            // send to adilines
            request.post(
              'https://adilines.eu-gb.mybluemix.net/',
              function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  console.log(body)
                }
              }
            );
          });

        };

        var resultHandler = function(err) {
          if(err) {
            console.log("unlink failed", err);
          } else {
            console.log("file deleted");
          }
        }
        // del file
        fs.unlink(data_fsPath, resultHandler);
      }
    }
    watch = setInterval(watchLoop, 500);
  });

  ipcMain.on('continue', function(event) {
    var goToGoogle = 'http://google.com';
    // TODO: go to adil's handshake
    driver.get(goToGoogle);
  });

  ipcMain.on('github', function(event){
    console.log("github");
    var goToGithub = 'https://github.com/goldsteinsveta/Adil';
    driver.get(goToGithub);
  });

  ipcMain.on('about', function(event){
    console.log("github");
    var goToAbout = 'http://datavalueadded.org/adil';
    driver.get(goToAbout);
  });

  ipcMain.on('neutralize', function(event) {

    modeFake_is(true);


    var data = [];
    function data_send() {
      data[0] = Date();
      data[1] = curUrl;
      console.log(data);
      event.sender.send('fakeData', data);
      data = [];
    }

    function fake_loop() {
      // chinese wiki's main
      var wikiUrl = 'https://zh.wikipedia.org/wiki/Wikipedia:%E9%A6%96%E9%A1%B5';

      function load_wiki() {
        // upd current url
        get_curUrl();

        if (curUrl == wikiUrl) {
          driver.get('https://zh.wikipedia.org/wiki/Special:%E9%9A%8F%E6%9C%BA%E9%A1%B5%E9%9D%A2')
          load_article();
        }
        else {
          // wait and try again
          setTimeout(load_wiki, 1000);
        }
      }
      var s;
      var s_google;
      function load_article() {
        // upd current url
        get_curUrl();

        if (curUrl == wikiUrl) {
          setTimeout(load_article, 1000);
        }
        else {
          data_send();
          // get string, ('https://zh.wikipedia.org/wiki/').length == 30;
          s = curUrl.substring(30, curUrl.length);
          // search string
          s_google = 'https://www.google.de/search?q=' + s
          driver.get(s_google);

          load_google();

        }
      }
      function load_google() {
        // upd current url
        get_curUrl();

        if (curUrl.indexOf(s_google) != -1) {
          data[2] = s;
          data_send();
          if (modeFake == true) {
            setTimeout(function(){
              driver.executeScript("window.history.go(-2)");
              load_wiki();
            },1000);
          };
        }
        else {
          // wait and try again
          setTimeout(load_google, 1000);
        }
      }

      driver.get(wikiUrl);
      load_wiki();
    }
    fake_loop();
  });

});

mb.on('after-create-window', function() {
  //mb.window.openDevTools();
  //mb.window.loadUrl();
});

mb.app.on('will-quit', function(){
  // stop watching loop to prevent error
  clearInterval(watch);
  setTimeout(function(){
    driver.quit();
  },1000);
});

ipcMain.on('quit', function(){
  modeFake_is(false);
  clearInterval(watch);
  // TODO: check stuff to quit, instead of waiting
  setTimeout(function(){
    driver.quit();
  },1500);
  setTimeout(function(){
    mb.app.quit();
  },2000);
});
