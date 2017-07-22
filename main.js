var fs = require('fs');
var request = require('request');

// express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.text());

var port = process.env.PORT || 8080
app.listen(port, function() {
  console.log("listening on " + port);
});

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
var curUrl = '';
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
    app.post('/', function (crx) {
      crx = JSON.parse(crx.body);
      console.log(crx)

      // check in which mode the link was requested
      if (crx.modeFake == false) {
        var data = [];

        // push res in data
        data[0] = crx['date'];
        data[1] = unescape(crx['url']);
        data[2] = crx['s'];

        // send to rendereer
        event.sender.send('newData', data);

        // write data
        var dataPath = path.join(__dirname, 'data', 'data.csv');
        fs.appendFile(dataPath, data + '\n', function (err) {
          if (err) {
            console.log('----> err!');  
          };
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
    });
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
      // push to data
      data[0] = Date();
      data[1] = curUrl;
      // check the mode, in case if user pressed collect meanwhile
      if (modeFake == true) {
        // send to renderer
        event.sender.send('fakeData', data);
      };
      data = [];
    }

    function fake_loop() {
      // chinese wiki's main
      var wikiUrl = 'https://zh.wikipedia.org/wiki/Special:%E9%9A%8F%E6%9C%BA%E9%A1%B5%E9%9D%A2';
      // search key
      var s;
      //search link
      var s_google;

      function load_wiki() {
        // check if zh.wiki is loaded
        if (curUrl.indexOf('zh.wikipedia.org') != -1) {
          data_send();
          // check if user pressed collect meanwhile
          if (modeFake == true) {
            get_curUrl();
            // get string, ('https://zh.wikipedia.org/wiki/').length == 30;
            s = curUrl.substring(30, curUrl.length);
            // search string
            s_google = 'https://www.google.de/search?q=' + s;

            if (modeFake == true) {
              driver.get(s_google);
              load_google();
              get_curUrl();
            };
          };
        }

        else {
          // wait and try again
          setTimeout(load_wiki, 1000);
        }
      }

      function load_google() {
        // check if google is loaded
        if (curUrl.indexOf(s_google) != -1) {
          data[2] = s;
          data_send();
          fake_loop();
        }
        else {
          // wait and try again
          setTimeout(load_google, 1000);
        }
      }

      if (modeFake == true) {
        driver.get(wikiUrl);
        load_wiki();
        // upd current url
        get_curUrl();
      };
    }
    fake_loop();
  });

});

mb.on('after-create-window', function() {
  // mb.window.openDevTools();
  // mb.window.loadUrl();
});

mb.app.on('will-quit', function(){
  setTimeout(function(){
    driver.quit();
  },1000);
});

ipcMain.on('quit', function(){
  modeFake_is(false);
  // TODO: check stuff to quit, instead of waiting
  setTimeout(function(){
    driver.quit();
  },1500);
  setTimeout(function(){
    mb.app.quit();
  },2000);
});
